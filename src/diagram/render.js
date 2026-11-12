// Renders diagram source to a hand-drawn-looking <svg> string with rough.js.
// Everything is deterministic: rough.js is seeded from a hash of the source
// and no DOM is needed (generator API only), so rebuilds are byte-identical.
const { createHash } = require('crypto');
// The CJS build exports `generator` directly; webpack picks the ESM build,
// which hangs it off the default export.
const roughModule = require('roughjs');
const rough = roughModule.default || roughModule;
const dagre = require('@dagrejs/dagre');

const { parse } = require('./parse');

const FONT = "'Segoe Print', 'Bradley Hand', 'Chalkboard SE', 'Comic Neue', 'Comic Sans MS', cursive, sans-serif";
const FONT_SIZE = 16;
const CHAR_W = 8.2; // rough per-character width for the font stack above
const PAD = 14;
// Marks rough.js fill strokes so they can be told apart from outlines (see
// Canvas.drawable); it never reaches the output.
const FILL_MARK = '#f0f';
const STANDALONE = ';background:#0d1315;color:#d8d4bd;padding:16px;border-radius:4px';
// The same rules as in src/css/style.css, with the palette inlined.
const STANDALONE_CSS =
  '.dg-edge .ln{stroke:#92b0c2}.dg-life .ln{stroke-opacity:.45}' +
  '.dg-blue{--dg:#92b0c2}.dg-red{--dg:#f88a87}.dg-green{--dg:#8cc298}.dg-orange{--dg:#f88f00}.dg-yellow{--dg:#bab215}' +
  '.dg-node .ln,.dg-node .fl{stroke:var(--dg,currentColor)}.dg-node .fs{fill:var(--dg)}';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const num = (n) => Math.round(n * 10) / 10;
const textWidth = (s) => s.length * CHAR_W;

function seedFor(source) {
  // rough.js wants a non-zero integer
  return (createHash('sha256').update(source).digest().readUInt32BE(0) % 2147483000) + 1;
}

class Canvas {
  constructor(seed) {
    this.gen = rough.generator();
    this.seed = seed;
    this.n = 0;
    this.out = [];
  }

  opts(style) {
    // A distinct seed per shape keeps shapes from looking identical, while
    // staying a pure function of the source.
    const o = { seed: this.seed + this.n++, roughness: 1.2, bowing: 1, strokeWidth: 1.6 };
    if (style) Object.assign(o, { fill: FILL_MARK, fillStyle: style.fill, fillWeight: 2, hachureGap: 7 });
    return o;
  }

  // Colours come from classes in src/css/style.css, so they follow the theme;
  // the attributes are the fallback for an SVG viewed on its own.
  begin(cls, style) {
    const colour = style ? ` dg-${style.color}` : '';
    this.out.push(`<g class="${cls}${colour}">`);
  }

  end() {
    this.out.push('</g>');
  }

  drawable(d, dashed) {
    const dash = dashed ? ' stroke-dasharray="6 5"' : '';
    for (const set of this.gen.toPaths(d)) {
      if (set.stroke === 'none') {
        // solid fill
        this.out.push(`<path class="fs" d="${set.d}" fill="currentColor" fill-opacity=".3" stroke="none"/>`);
      } else if (set.stroke === FILL_MARK) {
        this.out.push(`<path class="fl" d="${set.d}" stroke="currentColor" stroke-opacity=".6" stroke-width="${num(set.strokeWidth)}"/>`);
      } else {
        this.out.push(`<path class="ln" d="${set.d}" stroke="currentColor" stroke-width="${num(set.strokeWidth)}"${dash}/>`);
      }
    }
  }

  line(x1, y1, x2, y2, dashed) {
    this.drawable(this.gen.line(x1, y1, x2, y2, this.opts()), dashed);
  }

  path(points, dashed) {
    this.drawable(this.gen.linearPath(points, this.opts()), dashed);
  }

  rect(x, y, w, h, style) {
    this.drawable(this.gen.rectangle(x, y, w, h, this.opts(style)));
  }

  ellipse(cx, cy, w, h, style) {
    this.drawable(this.gen.ellipse(cx, cy, w, h, this.opts(style)));
  }

  polygon(points, style) {
    this.drawable(this.gen.polygon(points, this.opts(style)));
  }

  arrowhead(x, y, angle) {
    const len = 11;
    const a = 0.45;
    this.path([
      [x - len * Math.cos(angle - a), y - len * Math.sin(angle - a)],
      [x, y],
      [x - len * Math.cos(angle + a), y - len * Math.sin(angle + a)],
    ]);
  }

  text(x, y, str, anchor = 'middle') {
    this.out.push(
      `<text x="${num(x)}" y="${num(y)}" text-anchor="${anchor}" fill="currentColor" stroke="none">${esc(str)}</text>`
    );
  }
}

function layoutSequence(model, c) {
  const labelW = (p) => Math.max(textWidth(p.label) + 2 * PAD, 90);
  const minGap = 40;
  const ps = model.participants;
  const xs = [];
  ps.forEach((p, i) => {
    xs.push(i === 0 ? labelW(p) / 2 + 10 : xs[i - 1] + labelW(ps[i - 1]) / 2 + labelW(p) / 2 + minGap);
  });
  const idx = new Map(ps.map((p, i) => [p.id, i]));

  // Widen gaps so message text fits between its endpoints.
  for (const m of model.messages) {
    const a = idx.get(m.from);
    const b = idx.get(m.to);
    if (a === b) continue;
    const [lo, hi] = a < b ? [a, b] : [b, a];
    const need = textWidth(m.text) + 40;
    const have = xs[hi] - xs[lo];
    if (have < need) {
      const extra = (need - have) / (hi - lo);
      for (let i = lo + 1; i < xs.length; i++) xs[i] += extra * (Math.min(i, hi) - lo);
    }
  }

  const boxH = 40;
  const top = 8;
  const rowH = 46;
  const bottom = top + boxH + 20 + model.messages.length * rowH + 10;
  let width = xs[xs.length - 1] + labelW(ps[ps.length - 1]) / 2 + 10;
  for (const m of model.messages) {
    if (m.from === m.to) width = Math.max(width, xs[idx.get(m.from)] + 44 + textWidth(m.text) + 10);
  }
  const height = bottom + boxH + 8;

  ps.forEach((p, i) => {
    const w = labelW(p);
    c.begin('dg-life');
    c.line(xs[i], top + boxH, xs[i], bottom, true);
    c.end();
    for (const y of [top, bottom]) {
      c.begin('dg-node', p.style);
      c.rect(xs[i] - w / 2, y, w, boxH, p.style);
      c.text(xs[i], y + boxH / 2 + 5, p.label);
      c.end();
    }
  });

  model.messages.forEach((m, i) => {
    const y = top + boxH + 20 + (i + 1) * rowH - 12;
    const x1 = xs[idx.get(m.from)];
    const x2 = xs[idx.get(m.to)];
    c.begin('dg-edge');
    if (x1 === x2) {
      // self message: small loop to the right
      c.path([[x1, y - 8], [x1 + 36, y - 8], [x1 + 36, y + 8], [x1, y + 8]], m.dashed);
      c.arrowhead(x1, y + 8, Math.PI);
      c.end();
      c.text(x1 + 44, y + 4, m.text, 'start');
      return;
    }
    c.line(x1, y, x2, y, m.dashed);
    c.arrowhead(x2, y, x2 > x1 ? 0 : Math.PI);
    c.end();
    c.text((x1 + x2) / 2, y - 8, m.text);
  });

  return { width, height };
}

function nodeSize(n) {
  const w = textWidth(n.label) + 2 * PAD;
  const h = 40;
  if (n.shape === 'diamond') return { width: w * 1.5 + 10, height: h * 1.6 };
  return { width: Math.max(w, 70), height: h };
}

// Point where a ray from the node's centre toward (tx, ty) leaves its outline.
function clipToShape(n, tx, ty) {
  const dx = (tx - n.x) / (n.width / 2);
  const dy = (ty - n.y) / (n.height / 2);
  if (!dx && !dy) return [n.x, n.y];
  let s;
  if (n.shape === 'diamond') s = 1 / (Math.abs(dx) + Math.abs(dy));
  else if (n.shape === 'round') s = 1 / Math.hypot(dx, dy);
  else s = 1 / Math.max(Math.abs(dx), Math.abs(dy));
  return [n.x + dx * s * (n.width / 2), n.y + dy * s * (n.height / 2)];
}

function layoutFlow(model, c) {
  const horizontal = model.direction === 'LR' || model.direction === 'RL';
  const g = new dagre.graphlib.Graph({ multigraph: true });
  g.setGraph({ rankdir: model.direction, nodesep: 40, ranksep: 70, marginx: 10, marginy: 10 });
  g.setDefaultEdgeLabel(() => ({}));
  for (const n of model.nodes) g.setNode(n.id, nodeSize(n));
  model.edges.forEach((e, i) => {
    g.setEdge(e.from, e.to, e.label ? { width: textWidth(e.label) + 10, height: 22, labelpos: 'c' } : {}, String(i));
  });
  dagre.layout(g);

  const info = new Map(model.nodes.map((n) => [n.id, { ...n, ...g.node(n.id) }]));

  for (const n of info.values()) {
    const { x, y, width: w, height: h, style } = n;
    c.begin('dg-node', style);
    if (n.shape === 'round') c.ellipse(x, y, w, h, style);
    else if (n.shape === 'diamond') c.polygon([[x, y - h / 2], [x + w / 2, y], [x, y + h / 2], [x - w / 2, y]], style);
    else c.rect(x - w / 2, y - h / 2, w, h, style);
    c.text(x, y + 5, n.label);
    c.end();
  }

  model.edges.forEach((e, i) => {
    const de = g.edge(e.from, e.to, String(i));
    const a = info.get(e.from);
    const b = info.get(e.to);
    const pts = de.points.slice(1, -1).map((p) => [p.x, p.y]);
    const first = clipToShape(a, ...(pts[0] || [b.x, b.y]));
    const last = clipToShape(b, ...(pts[pts.length - 1] || [a.x, a.y]));
    const line = [first, ...pts, last];
    c.begin('dg-edge');
    c.path(line, e.dashed);
    if (e.arrow) {
      const [px, py] = line[line.length - 2];
      c.arrowhead(last[0], last[1], Math.atan2(last[1] - py, last[0] - px));
    }
    c.end();
    if (e.label) {
      // Keep the label clear of the stroke: above it when edges run sideways,
      // to its right when they run down the page.
      if (horizontal) c.text(de.x, de.y - 8, e.label);
      else c.text(de.x + 8, de.y + 5, e.label, 'start');
    }
  });

  const { width, height } = g.graph();
  return { width, height };
}

function describe(model) {
  if (model.type === 'sequence') {
    const steps = model.messages.map((m) => `${m.from} to ${m.to}: ${m.text}`).join('; ');
    return `Sequence diagram between ${model.participants.map((p) => p.label).join(', ')}. ${steps}.`;
  }
  const label = (id) => model.nodes.find((n) => n.id === id).label;
  const steps = model.edges.map((e) => `${label(e.from)} to ${label(e.to)}${e.label ? ` (${e.label})` : ''}`).join('; ');
  return `Flow diagram. ${steps}.`;
}

/**
 * @param {string} source diagram source (see parse.js)
 * @param {{alt?: string, standalone?: boolean}} [options] alt becomes
 *   <title>; a generated step-by-step description becomes <desc>. standalone
 *   gives the SVG the code-block panel colours, for use outside the site.
 * @returns {string} an <svg> element
 */
function renderDiagram(source, options = {}) {
  const model = parse(source);
  const seed = seedFor(source);
  const c = new Canvas(seed);
  const size = model.type === 'sequence' ? layoutSequence(model, c) : layoutFlow(model, c);

  const w = Math.ceil(size.width + 8);
  const h = Math.ceil(size.height + 8);
  const id = `diagram-${seed.toString(36)}`;
  const title = options.alt || (model.type === 'sequence' ? 'Sequence diagram' : 'Flow diagram');

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" class="diagram-svg" role="img" aria-labelledby="${id}-t ${id}-d"` +
    ` viewBox="-4 -4 ${w} ${h}" width="${w}" height="${h}"` +
    ` style="max-width:100%;height:auto${options.standalone ? STANDALONE : ''}"` +
    ` fill="none" stroke-linecap="round" stroke-linejoin="round"` +
    ` font-family="${esc(FONT)}" font-size="${FONT_SIZE}">` +
    (options.standalone ? `<style>${STANDALONE_CSS}</style>` : '') +
    `<title id="${id}-t">${esc(title)}</title><desc id="${id}-d">${esc(describe(model))}</desc>` +
    c.out.join('') +
    '</svg>'
  );
}

module.exports = { renderDiagram };
