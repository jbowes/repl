// Parses and validates schematic source: a small YAML schema describing
// physical objects in 3D coordinates [x, y, z] (x right, y toward the viewer in
// plan, z up). Every error names the field path, e.g. `shapes[2].size`.
//
//   units: mm
//   scale: 2.4              # px per unit (optional; fitted to ~240px if absent)
//   views: [plan, front, iso]
//   shapes:
//     - { type: box, id: body, at: [0, 0, 0], size: [110, 104, 102], style: blue }
//     - { type: dim, from: [0, 104, 0], to: [110, 104, 0], offset: [0, 22, 0] }
//
// The result is a flat list of shapes: groups are resolved by translating their
// children and inheriting the group's style.
const yaml = require('js-yaml');
const { COLORS, FILLS } = require('../diagram/parse');
const { SIDES, wallLength } = require('./hollow');

const VIEWS = ['plan', 'front', 'side', 'section', 'iso'];
const TYPES = {
  box: ['at', 'size', 'hidden', 'wall', 'floor', 'scoops'],
  cylinder: ['at', 'r', 'h'],
  rect: ['at', 'size', 'dashed'],
  line: ['points', 'dashed', 'closed'],
  dim: ['from', 'to', 'offset', 'text'],
  label: ['at', 'text', 'to'],
  group: ['at', 'shapes'],
};
const ALIASES = { plane: 'rect', wire: 'line' };
const COMMON = ['type', 'id', 'label', 'style', 'views'];
const TOP = ['units', 'scale', 'view', 'views', 'columns', 'cut', 'shapes'];

class SchematicError extends Error {
  constructor(path, msg) {
    super(`schematic: ${path ? path + ': ' : ''}${msg}`);
    this.name = 'SchematicError';
  }
}

const show = (v) => (typeof v === 'string' ? JSON.stringify(v) : JSON.stringify(v) ?? String(v));
const isNum = (n) => typeof n === 'number' && Number.isFinite(n);

function parseStyle(name, path) {
  const m = typeof name === 'string' && /^([a-z]+)(?:-([a-z]+))?$/.exec(name);
  if (!m || !COLORS.includes(m[1]) || (m[2] && !FILLS[m[2]])) {
    throw new SchematicError(path, `unknown style ${show(name)} (colours ${COLORS.join(', ')}; fills ${Object.keys(FILLS).join(', ')} as a -suffix)`);
  }
  return { color: m[1], fill: FILLS[m[2] || 'hachure'] };
}

// [x, y] or [x, y, z] -> [x, y, z]
function point(v, path) {
  if (!Array.isArray(v) || (v.length !== 2 && v.length !== 3) || !v.every(isNum)) {
    throw new SchematicError(path, `expected a point [x, y, z] of numbers (z optional), got ${show(v)}`);
  }
  return [v[0], v[1], v.length === 3 ? v[2] : 0];
}

function sizeOf(v, path, n) {
  const ok = Array.isArray(v) && v.length === n && v.every((x) => isNum(x) && x > 0);
  if (!ok) {
    throw new SchematicError(path, `expected ${n === 3 ? '[w, d, h]' : '[w, d]'} of positive numbers, got ${show(v)}`);
  }
  return v.slice();
}

const positive = (v, path) => {
  if (!isNum(v) || v <= 0) throw new SchematicError(path, `expected a positive number, got ${show(v)}`);
  return v;
};

const required = (obj, key, path) => {
  if (obj[key] === undefined) throw new SchematicError(`${path}.${key}`, 'is required');
  return obj[key];
};

function bool(v, path) {
  if (typeof v !== 'boolean') throw new SchematicError(path, `expected true or false, got ${show(v)}`);
  return v;
}

function shape(raw, path, ids, parentStyle) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new SchematicError(path, 'expected a mapping with a `type`');
  }
  if (raw.type === undefined) throw new SchematicError(`${path}.type`, 'is required');
  const type = ALIASES[raw.type] || raw.type;
  if (!Object.prototype.hasOwnProperty.call(TYPES, type)) {
    throw new SchematicError(`${path}.type`, `unknown primitive ${show(raw.type)} (${Object.keys(TYPES).join(', ')})`);
  }
  for (const key of Object.keys(raw)) {
    if (!COMMON.includes(key) && !TYPES[type].includes(key)) {
      throw new SchematicError(`${path}.${key}`, `unknown field for ${type} (allowed: ${[...COMMON, ...TYPES[type]].join(', ')})`);
    }
  }

  const s = { type };
  if (raw.id !== undefined) {
    if (typeof raw.id !== 'string' || !raw.id) throw new SchematicError(`${path}.id`, `expected a non-empty string, got ${show(raw.id)}`);
    if (ids.has(raw.id)) throw new SchematicError(`${path}.id`, `duplicate id ${show(raw.id)}`);
    ids.add(raw.id);
    s.id = raw.id;
  }
  if (raw.label !== undefined) s.label = String(raw.label);
  if (raw.style !== undefined) s.style = parseStyle(raw.style, `${path}.style`);
  else if (parentStyle) s.style = parentStyle;
  if (raw.views !== undefined) {
    const ok = Array.isArray(raw.views) && raw.views.length && raw.views.every((v) => VIEWS.includes(v));
    if (!ok) throw new SchematicError(`${path}.views`, `expected a list of ${VIEWS.join(', ')}, got ${show(raw.views)}`);
    s.views = raw.views.slice();
  }

  const flag = (k) => (raw[k] === undefined ? false : bool(raw[k], `${path}.${k}`));
  switch (type) {
    case 'box':
      s.at = point(required(raw, 'at', path), `${path}.at`);
      s.size = sizeOf(required(raw, 'size', path), `${path}.size`, 3);
      s.hidden = flag('hidden');
      if (raw.wall !== undefined) {
        // A hollow, open-top shell: walls `wall` thick, floor `floor` thick.
        s.wall = positive(raw.wall, `${path}.wall`);
        if (s.wall * 2 >= Math.min(s.size[0], s.size[1])) {
          throw new SchematicError(`${path}.wall`, `must be less than half of w and d ${show(s.size.slice(0, 2))}, got ${show(raw.wall)}`);
        }
        s.floor = raw.floor === undefined ? s.wall : positive(raw.floor, `${path}.floor`);
        if (s.floor >= s.size[2]) throw new SchematicError(`${path}.floor`, `must be less than h (${s.size[2]}), got ${show(raw.floor)}`);
      } else if (raw.floor !== undefined) {
        throw new SchematicError(`${path}.floor`, 'needs wall (a hollow box has both)');
      }
      scoopsOf(raw, s, path);
      break;
    case 'cylinder':
      s.at = point(required(raw, 'at', path), `${path}.at`);
      s.r = positive(required(raw, 'r', path), `${path}.r`);
      s.h = positive(required(raw, 'h', path), `${path}.h`);
      break;
    case 'rect': {
      s.at = point(required(raw, 'at', path), `${path}.at`);
      const sz = required(raw, 'size', path);
      // [w, d] or [w, d, h]; only the footprint is used
      s.size = sizeOf(Array.isArray(sz) && sz.length === 3 ? sz.slice(0, 2) : sz, `${path}.size`, 2);
      s.dashed = flag('dashed');
      break;
    }
    case 'line': {
      const pts = required(raw, 'points', path);
      if (!Array.isArray(pts) || pts.length < 2) throw new SchematicError(`${path}.points`, `expected at least two points, got ${show(pts)}`);
      s.points = pts.map((p, i) => point(p, `${path}.points[${i}]`));
      s.dashed = flag('dashed');
      s.closed = flag('closed');
      break;
    }
    case 'dim':
      s.from = point(required(raw, 'from', path), `${path}.from`);
      s.to = point(required(raw, 'to', path), `${path}.to`);
      s.offset = raw.offset === undefined ? [0, 0, 0] : point(raw.offset, `${path}.offset`);
      if (raw.text !== undefined) s.text = String(raw.text);
      break;
    case 'label':
      s.at = point(required(raw, 'at', path), `${path}.at`);
      s.text = String(required(raw, 'text', path));
      if (raw.to !== undefined) s.to = point(raw.to, `${path}.to`);
      break;
    case 'group': {
      s.at = raw.at === undefined ? [0, 0, 0] : point(raw.at, `${path}.at`);
      const kids = required(raw, 'shapes', path);
      if (!Array.isArray(kids)) throw new SchematicError(`${path}.shapes`, `expected a list, got ${show(kids)}`);
      const out = [];
      kids.forEach((k, i) => out.push(...shape(k, `${path}.shapes[${i}]`, ids, s.style)));
      return out.map((c) => translate(c, s.at));
    }
  }
  return [s];
}

// `scoops` notch the walls of a hollow box (one with `wall`) down from the rim,
// through the wall's full thickness.
function scoopsOf(raw, s, path) {
  if (raw.scoops !== undefined && raw.wall === undefined) {
    throw new SchematicError(`${path}.scoops`, 'needs `wall`: only a hollow box (with a wall thickness) can have scoops');
  }
  if (raw.wall === undefined) return;
  const [, , h] = s.size;
  const t = s.wall;
  const floor = s.floor;
  s.scoops = [];
  if (raw.scoops === undefined) return;
  if (!Array.isArray(raw.scoops)) throw new SchematicError(`${path}.scoops`, `expected a list, got ${show(raw.scoops)}`);
  raw.scoops.forEach((r, i) => {
    const p = `${path}.scoops[${i}]`;
    if (!r || typeof r !== 'object' || Array.isArray(r)) throw new SchematicError(p, 'expected a mapping with side, at, width');
    for (const key of Object.keys(r)) {
      if (!['side', 'at', 'width', 'depth', 'shape'].includes(key)) {
        throw new SchematicError(`${p}.${key}`, 'unknown field for a scoop (allowed: side, at, width, depth, shape)');
      }
    }
    const side = required(r, 'side', p);
    if (!SIDES.includes(side)) throw new SchematicError(`${p}.side`, `unknown side ${show(side)} (${SIDES.join(', ')})`);
    const shape = r.shape === undefined ? 'u' : r.shape;
    if (shape !== 'u' && shape !== 'round') throw new SchematicError(`${p}.shape`, `unknown shape ${show(shape)} (u, round)`);
    const at = required(r, 'at', p);
    if (!isNum(at)) throw new SchematicError(`${p}.at`, `expected a number, got ${show(at)}`);
    const width = positive(required(r, 'width', p), `${p}.width`);
    const len = wallLength(s.size, side);
    if (at - width / 2 < t - 1e-9 || at + width / 2 > len - t + 1e-9) {
      throw new SchematicError(p, `scoop does not fit in the ${side} wall: at +- width/2 must lie between ${t} and ${len - t}`);
    }
    let depth;
    if (shape === 'round') {
      if (r.depth !== undefined && r.depth !== width / 2) {
        throw new SchematicError(`${p}.depth`, `a round scoop is a semicircle, so its depth is width/2 (${width / 2}); omit depth or use shape: u`);
      }
      depth = width / 2;
    } else {
      depth = positive(required(r, 'depth', p), `${p}.depth`);
    }
    if (depth > h - floor + 1e-9) {
      throw new SchematicError(`${p}.depth`, `${depth} is deeper than the wall is tall (${h - floor}, the height above the floor)`);
    }
    s.scoops.push({ side, at, width, depth, shape });
  });
  s.scoops.forEach((a, i) => {
    s.scoops.slice(0, i).forEach((b, j) => {
      if (a.side === b.side && Math.abs(a.at - b.at) < (a.width + b.width) / 2) {
        throw new SchematicError(`${path}.scoops[${i}]`, `overlaps scoops[${j}] on the ${a.side} wall`);
      }
    });
  });
}

function translate(s, d) {
  if (!d[0] && !d[1] && !d[2]) return s;
  const mv = (p) => [p[0] + d[0], p[1] + d[1], p[2] + d[2]];
  const out = { ...s };
  for (const k of ['at', 'from', 'to']) if (out[k]) out[k] = mv(out[k]);
  if (out.points) out.points = out.points.map(mv);
  return out;
}

function viewList(list, path) {
  const ok = Array.isArray(list) && list.length && list.every((v) => VIEWS.includes(v));
  if (!ok) throw new SchematicError(path, `expected a list of ${VIEWS.join(', ')}, got ${show(list)}`);
  return list.slice();
}

/**
 * @param {string} source YAML
 * @returns {{units: string, scale?: number, views: string[], columns?: number, shapes: object[]}}
 */
function parse(source) {
  let doc;
  try {
    doc = yaml.load(source);
  } catch (err) {
    throw new SchematicError('', `invalid YAML: ${err.message.split('\n')[0]}`);
  }
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) throw new SchematicError('', 'expected a mapping with a `shapes` list');
  for (const key of Object.keys(doc)) {
    if (!TOP.includes(key)) throw new SchematicError(key, `unknown field (allowed: ${TOP.join(', ')})`);
  }

  const model = { units: 'mm' };
  if (doc.units !== undefined) {
    if (typeof doc.units !== 'string') throw new SchematicError('units', `expected a string, got ${show(doc.units)}`);
    model.units = doc.units;
  }
  if (doc.scale !== undefined) model.scale = positive(doc.scale, 'scale');
  if (doc.columns !== undefined) {
    if (!Number.isInteger(doc.columns) || doc.columns < 1) throw new SchematicError('columns', `expected a positive integer, got ${show(doc.columns)}`);
    model.columns = doc.columns;
  }
  if (doc.view !== undefined && doc.views !== undefined) throw new SchematicError('views', 'use either `view` or `views`, not both');
  if (doc.cut !== undefined) {
    if (!isNum(doc.cut)) throw new SchematicError('cut', `expected a number (the y of the section plane), got ${show(doc.cut)}`);
    model.cut = doc.cut;
  }
  if (doc.views !== undefined) model.views = viewList(doc.views, 'views');
  else if (doc.view !== undefined) model.views = viewList([doc.view], 'view');
  else model.views = ['plan'];

  const shapes = doc.shapes;
  if (!Array.isArray(shapes) || !shapes.length) throw new SchematicError('shapes', `expected a non-empty list, got ${show(shapes)}`);
  const ids = new Set();
  model.shapes = [];
  shapes.forEach((raw, i) => model.shapes.push(...shape(raw, `shapes[${i}]`, ids)));
  return model;
}

/** Parses a view list from a fence option: "iso" or "plan,front,iso". */
function parseViewOption(text) {
  return viewList(String(text).split(/[\s,]+/).filter(Boolean), 'view');
}

module.exports = { parse, parseViewOption, SchematicError, VIEWS };
