// Renders schematic source (see schema.js) to an <svg> string in the technical
// line-art style of src/diagram: the same panel, palette classes and TechCanvas
// primitives. Deterministic: no randomness, no DOM, byte-identical rebuilds.
//
// One source can be drawn as several views of the same 3D model:
//   plan   top-down (x right, y down; z ignored)
//   front  elevation from +y (x right, z up)
//   side   elevation from +x (y right, z up)
//   iso    30-degree isometric: sx = (x - y) cos30, sy = (x + y) sin30 - z
const { createHash } = require('crypto');

const { parse, parseViewOption } = require('./schema');
const { project, extent, paintOrder, isoCircle, points: shapePoints } = require('./project');
const { SchematicCanvas, esc, num } = require('./canvas');
const { SIDES, wallFrame, wallPoint, faceLoop, rimPieces, rimEdges, cutBand } = require('./hollow');
const { STANDALONE, STANDALONE_CSS } = require('../diagram/render');

const FIT = 240; // px the largest dimension gets when `scale` is not given
const FRAME_PAD = 16;
const CELL_GAP = 28;
const ARROW = 11;

const fmt = (n) => String(Math.round(n * 100) / 100);

function seedFor(source, views) {
  return (createHash('sha256').update(source + '\n' + views.join(',')).digest().readUInt32BE(0) % 2147483000) + 1;
}

function autoScale(model) {
  const all = model.shapes.flatMap(shapePoints);
  if (!all.length) return 1;
  let span = 0;
  for (let i = 0; i < 3; i++) {
    span = Math.max(span, Math.max(...all.map((p) => p[i])) - Math.min(...all.map((p) => p[i])));
  }
  return span > 0 ? Math.round((FIT / span) * 100) / 100 : 1;
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const centroid = (pts) => [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length];
const boxOf = (pts) => {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
};
const area = (pts) => Math.abs(pts.reduce((a, p, i) => { const q = pts[(i + 1) % pts.length]; return a + p[0] * q[1] - q[0] * p[1]; }, 0) / 2);
const polyShape = (pts) => (a) => `<polygon points="${pts.map(([x, y]) => `${num(x)},${num(y)}`).join(' ')}" ${a}/>`;

function drawView(model, view, scale, c) {
  const P = (p) => {
    const [u, v] = project(p, view);
    return [u * scale, v * scale];
  };
  const b = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
  const grow = (x, y) => {
    b.x0 = Math.min(b.x0, x);
    b.y0 = Math.min(b.y0, y);
    b.x1 = Math.max(b.x1, x);
    b.y1 = Math.max(b.y1, y);
  };
  const growAll = (pts) => pts.forEach(([x, y]) => grow(x, y));
  const text = (x, y, str, opts) => {
    const half = c.textWidth(str) / 2;
    const a = ((opts && opts.angle) || 0) * Math.PI / 180;
    const anchor = (opts && opts.anchor) || 'middle';
    const from = anchor === 'middle' ? -half : anchor === 'start' ? 0 : -2 * half;
    for (const t of [from, from + 2 * half]) grow(x + t * Math.cos(a), y + t * Math.sin(a));
    grow(x + 8 * Math.sin(a), y - 8 * Math.cos(a));
    grow(x - 8 * Math.sin(a), y + 8 * Math.cos(a));
    c.halo(x, y, str, opts);
  };

  let shapes = model.shapes.filter((s) => !s.views || s.views.includes(view));
  // A section cuts the model at y = cut (default: the middle) and removes the
  // near half, so solids wholly on the viewer's side of the cut are not drawn.
  const ys = model.shapes.flatMap(shapePoints).map((p) => p[1]);
  const cut = model.cut ?? (Math.min(...ys) + Math.max(...ys)) / 2;
  if (view === 'section') shapes = shapes.filter((s) => !extent(s) || extent(s).min[1] < cut);
  const solids = paintOrder(shapes.filter((s) => extent(s)), view);

  const drawLabel = (s, [cx, cy]) => {
    if (s.label) text(cx, cy + 4, s.label);
  };

  // Hidden cavity edges are annotations, drawn over everything (see below).
  const overlay = [];
  const ringShape = (outer, inner) => (a) =>
    `<path d="M${outer.map(([x, y]) => `${num(x)},${num(y)}`).join('L')}ZM${inner.map(([x, y]) => `${num(x)},${num(y)}`).join('L')}Z" fill-rule="evenodd" clip-rule="evenodd" ${a}/>`;

  const scoopsOn = (s, side) => s.scoops.filter((sc) => sc.side === side);
  // How far the scoops on `side` cut down the wall at distance v along it from its start.
  const dropAt = (s, side, v) => {
    let drop = 0;
    for (const sc of scoopsOn(s, side)) {
      const rx = sc.width / 2;
      const ry = Math.min(sc.depth, rx);
      const off = Math.abs(v - sc.at);
      if (off < rx) drop = Math.max(drop, sc.depth - ry + ry * Math.sqrt(1 - (off / rx) ** 2));
    }
    return drop;
  };

  const drawBox = (s) => {
    // A part of a wall that is lower than, or beyond, the hatched material
    // around it: a flat tint and a fainter outline.
    const lowered = (q) => {
      c.shade(polyShape(q), boxOf(q), s.style && { ...s.style, fill: 'solid' }, 'right');
      c.polygon2(q, { opacity: 0.55 });
    };
    const e = extent(s);
    const [x0, y0, z0] = e.min;
    const [x1, y1, z1] = e.max;
    const hollow = s.wall !== undefined;
    // Inner cavity: open at the top, `wall` in from the sides, `floor` up.
    const [ix0, ix1, iy0, iy1, fz] = hollow ? [x0 + s.wall, x1 - s.wall, y0 + s.wall, y1 - s.wall, z0 + s.floor] : [];
    if (view !== 'iso') {
      const rect = boxOf([x0, x1].flatMap((x) => [y0, y1].flatMap((y) => [z0, z1].map((z) => P([x, y, z])))));
      let poly = [[rect.x, rect.y], [rect.x + rect.w, rect.y], [rect.x + rect.w, rect.y + rect.h], [rect.x, rect.y + rect.h]];
      growAll(poly);
      // Scoops in the wall facing the viewer notch the outline of its face.
      const facing = view === 'front' ? '+y' : view === 'side' ? '+x' : null;
      if (hollow && facing && scoopsOn(s, facing).length) {
        const f = wallFrame(e, s.wall, facing);
        poly = faceLoop(f, f.outer, f.start, f.start + f.len, z0, scoopsOn(s, facing)).map(P);
      }
      c.backing(polyShape(poly));
      if (hollow && view === 'plan' && s.scoops.length) {
        // The rim in pieces. A scoop only lowers the wall, so from above the
        // wall is still there under it: drawn darker, without the rim's hatch.
        for (const side of SIDES) {
          const f = wallFrame(e, s.wall, side);
          for (const sc of scoopsOn(s, side)) {
            const [u0, u1] = [f.start + sc.at - sc.width / 2, f.start + sc.at + sc.width / 2];
            const q = [[f.outer, u0], [f.outer, u1], [f.inner, u1], [f.inner, u0]].map(([n, u]) => P(wallPoint(f, n, u, z1)));
            lowered(q);
          }
          for (const piece of rimPieces(f, s.wall, scoopsOn(s, side))) {
            const q = piece.map(P);
            c.shade(polyShape(q), boxOf(q), s.style, 'flat');
          }
        }
        // Outlines last and only on real edges, so the walls' pieces read as
        // one rim with no seam at the corners.
        for (const side of SIDES) {
          for (const edge of rimEdges(wallFrame(e, s.wall, side), s.wall, scoopsOn(s, side))) c.polyline(edge.map(P));
        }
        drawLabel(s, centroid(poly));
        return;
      }
      if (hollow && view === 'plan') {
        // The rim is hatched; the cavity is left empty.
        const inner = [[ix0, iy0], [ix1, iy0], [ix1, iy1], [ix0, iy1]].map(([x, y]) => P([x, y, z1]));
        c.shade(ringShape(poly, inner), rect, s.style, 'flat');
        c.polygon2(poly);
        c.polygon2(inner);
        drawLabel(s, centroid(poly));
        return;
      }
      if (hollow && view === 'section') {
        // Cut through the middle: only the walls and floor are cut material,
        // the cavity is empty.
        // A scoop the cut passes through lowers the top of that wall.
        const zl = z1 - dropAt(s, '-x', cut - y0);
        const zr = z1 - dropAt(s, '+x', cut - y0);
        const u = [[x0, zl], [x0, z0], [x1, z0], [x1, zr], [ix1, zr], [ix1, fz], [ix0, fz], [ix0, zl]].map(([x, z]) => P([x, y0, z]));
        // Past the cut the wall carries on at full height: not cut material,
        // so it is drawn darker and unhatched above the lowered top.
        for (const [xa, xb, zt] of [[x0, ix0, zl], [ix1, x1, zr]]) {
          if (zt < z1) lowered([[xa, z1], [xb, z1], [xb, zt], [xa, zt]].map(([x, z]) => P([x, y0, z])));
        }
        c.shade(polyShape(u), rect, s.style, 'flat');
        c.polygon2(u);
        drawLabel(s, centroid(poly));
        return;
      }
      c.shade(polyShape(poly), rect, s.style, 'flat');
      c.polygon2(poly);
      if (hollow) {
        // Seen from the side the cavity is hidden: dash-dot, open at the top.
        const [a0, a1] = view === 'front' ? [ix0, ix1] : [iy0, iy1];
        const at = (a, z) => P(view === 'front' ? [a, y0, z] : [x0, a, z]);
        overlay.push([at(a0, z1), at(a0, fz), at(a1, fz), at(a1, z1)]);
      }
      drawLabel(s, centroid(poly));
      return;
    }
    if (hollow) {
      // The inside, seen through the open top: the floor and the two inner
      // walls that face the viewer. The outer faces are drawn after and hide
      // what is below the front rim.
      const inside = [
        ['top', [[ix0, iy0, fz], [ix1, iy0, fz], [ix1, iy1, fz], [ix0, iy1, fz]]],
        ['right', [[ix0, iy0, fz], [ix0, iy1, fz], [ix0, iy1, z1], [ix0, iy0, z1]]],
        ['left', [[ix0, iy0, fz], [ix1, iy0, fz], [ix1, iy0, z1], [ix0, iy0, z1]]],
      ];
      if (s.scoops.length) {
        // The inner faces of the far walls carry the scoops too.
        for (const [k, side, face] of [[1, '-x', 'right'], [2, '-y', 'left']]) {
          const f = wallFrame(e, s.wall, side);
          inside[k] = [face, faceLoop(f, f.inner, f.start + s.wall, f.start + f.len - s.wall, fz, scoopsOn(s, side))];
        }
      }
      for (const [face, corners] of inside) {
        const poly = corners.map(P);
        growAll(poly);
        c.backing(polyShape(poly));
        c.shade(polyShape(poly), boxOf(poly), s.style, face);
        c.polygon2(poly);
      }
    }
    const faces = [
      ['left', [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]]],
      ['right', [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]]],
      ['top', [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]]],
    ];
    if (hollow && s.scoops.length) {
      for (const [k, side] of [[0, '+y'], [1, '+x']]) {
        const f = wallFrame(e, s.wall, side);
        faces[k][1] = faceLoop(f, f.outer, f.start, f.start + f.len, z0, scoopsOn(s, side));
      }
    }
    let topCentre;
    for (const [face, corners] of faces) {
      const poly = corners.map(P);
      growAll(poly);
      if (face === 'top') topCentre = centroid(poly);
      if (face === 'top' && hollow && s.scoops.length) {
        // The cut surface of each scoop, then the rim in pieces around the gaps.
        for (const sc of s.scoops) {
          const band = cutBand(wallFrame(e, s.wall, sc.side), sc).map(P);
          growAll(band);
          c.backing(polyShape(band));
          c.shade(polyShape(band), boxOf(band), s.style, 'top');
          c.polygon2(band);
        }
        for (const side of SIDES) {
          for (const piece of rimPieces(wallFrame(e, s.wall, side), s.wall, scoopsOn(s, side))) {
            const q = piece.map(P);
            c.backing(polyShape(q));
            c.shade(polyShape(q), boxOf(q), s.style, 'top');
          }
        }
        // Outlines last and only on real edges: no seam where walls meet.
        for (const side of SIDES) {
          for (const edge of rimEdges(wallFrame(e, s.wall, side), s.wall, scoopsOn(s, side))) c.polyline(edge.map(P));
        }
        continue;
      }
      if (face === 'top' && hollow) {
        // The rim: the top face with the opening cut out.
        const inner = [[ix0, iy0, z1], [ix1, iy0, z1], [ix1, iy1, z1], [ix0, iy1, z1]].map(P);
        c.backing(ringShape(poly, inner));
        c.shade(ringShape(poly, inner), boxOf(poly), s.style, 'top');
        c.polygon2(poly);
        c.polygon2(inner);
        continue;
      }
      c.backing(polyShape(poly));
      c.shade(polyShape(poly), boxOf(poly), s.style, face);
      c.polygon2(poly);
    }
    if (s.hidden && !hollow) {
      // The three edges meeting at the far, bottom corner.
      for (const end of [[x1, y0, z0], [x0, y1, z0], [x0, y0, z1]]) {
        c.polyline([P([x0, y0, z0]), P(end)], { dashed: true, opacity: 0.4, width: 1 });
      }
    }
    drawLabel(s, topCentre);
  };

  const drawCylinder = (s) => {
    const [cx3, cy3, cz] = s.at;
    const r = s.r;
    const [bx, by] = P([cx3, cy3, cz]);
    const [, ty] = P([cx3, cy3, cz + s.h]);
    if (view === 'plan') {
      const rr = r * scale;
      const el = (a) => `<ellipse cx="${num(bx)}" cy="${num(by)}" rx="${num(rr)}" ry="${num(rr)}" ${a}/>`;
      grow(bx - rr - 8, by - rr - 8);
      grow(bx + rr + 8, by + rr + 8);
      c.backing(el);
      c.shade(el, { x: bx - rr, y: by - rr, w: 2 * rr, h: 2 * rr }, s.style, 'flat');
      c.out.push(el('class="ln" stroke="currentColor" stroke-width="1.5"'));
      c.polyline([[bx - rr - 6, by], [bx + rr + 6, by]], { dashed: true, width: 0.9, opacity: 0.6 });
      c.polyline([[bx, by - rr - 6], [bx, by + rr + 6]], { dashed: true, width: 0.9, opacity: 0.6 });
      drawLabel(s, [bx, by]);
    } else if (view === 'front' || view === 'side' || view === 'section') {
      const rr = r * scale;
      const poly = [[bx - rr, ty], [bx + rr, ty], [bx + rr, by], [bx - rr, by]];
      growAll(poly);
      grow(bx, ty - 8);
      grow(bx, by + 8);
      c.backing(polyShape(poly));
      c.shade(polyShape(poly), boxOf(poly), s.style, 'flat');
      c.polygon2(poly);
      c.polyline([[bx, ty - 6], [bx, by + 6]], { dashed: true, width: 0.9, opacity: 0.6 });
      drawLabel(s, [bx, (ty + by) / 2]);
    } else {
      const [rx0, ry0] = isoCircle(r);
      const rx = rx0 * scale;
      const ry = ry0 * scale;
      grow(bx - rx, ty - ry);
      grow(bx + rx, by + ry);
      const body = `M${num(bx - rx)},${num(ty)}L${num(bx - rx)},${num(by)}A${num(rx)},${num(ry)} 0 0 0 ${num(bx + rx)},${num(by)}L${num(bx + rx)},${num(ty)}`;
      const bodyShape = (a) => `<path d="${body}Z" ${a}/>`;
      const topShape = (a) => `<ellipse cx="${num(bx)}" cy="${num(ty)}" rx="${num(rx)}" ry="${num(ry)}" ${a}/>`;
      c.backing(bodyShape);
      c.shade(bodyShape, { x: bx - rx, y: ty, w: 2 * rx, h: by - ty + ry }, s.style, 'left');
      c.out.push(`<path class="ln" d="${body}" stroke="currentColor" stroke-width="1.5"/>`);
      c.backing(topShape);
      c.shade(topShape, { x: bx - rx, y: ty - ry, w: 2 * rx, h: 2 * ry }, s.style, 'top');
      c.out.push(topShape('class="ln" stroke="currentColor" stroke-width="1.5"'));
      drawLabel(s, [bx, ty]);
    }
  };

  const drawRect = (s) => {
    const [x, y, z] = s.at;
    const poly = [[x, y, z], [x + s.size[0], y, z], [x + s.size[0], y + s.size[1], z], [x, y + s.size[1], z]].map(P);
    growAll(poly);
    if (area(poly) < 1) {
      // Seen edge on, a horizontal outline is a line.
      const ends = poly.slice().sort((p, q) => p[0] - q[0] || p[1] - q[1]);
      c.polyline([ends[0], ends[ends.length - 1]], { dashed: s.dashed });
      return;
    }
    c.shade(polyShape(poly), boxOf(poly), s.style, view === 'iso' ? 'top' : 'flat');
    c.polygon2(poly, { dashed: s.dashed });
    drawLabel(s, centroid(poly));
  };

  const draw = { box: drawBox, cylinder: drawCylinder, rect: drawRect };
  for (const s of solids) {
    c.begin('dg-node', s.style);
    draw[s.type](s);
    c.end();
  }

  for (const pts of overlay) c.polyline(pts, { dashed: true, opacity: 0.6, width: 1 });

  for (const s of shapes.filter((x) => x.type === 'line')) {
    const pts = s.points.map(P);
    growAll(pts);
    c.begin('dg-node', s.style);
    c.polyline(pts, { dashed: s.dashed, closed: s.closed });
    if (s.label) {
      const [m, n] = pts;
      text((m[0] + n[0]) / 2, (m[1] + n[1]) / 2 - 8, s.label);
    }
    c.end();
  }

  for (const s of shapes.filter((x) => x.type === 'dim')) drawDim(s);
  for (const s of shapes.filter((x) => x.type === 'label')) drawCallout(s);

  function drawDim(s) {
    const p = P(s.from);
    const q = P(s.to);
    const o = sub(P(add3(s.from, s.offset)), p);
    const a = [p[0] + o[0], p[1] + o[1]];
    const z = [q[0] + o[0], q[1] + o[1]];
    const len = Math.hypot(z[0] - a[0], z[1] - a[1]);
    if (len < 2) return; // along the line of sight in this view
    const dist = Math.hypot(...s.to.map((v, i) => v - s.from[i]));
    const str = s.text ?? s.label ?? `${fmt(dist)} ${model.units}`;
    c.begin('dg-edge');
    const olen = Math.hypot(o[0], o[1]);
    if (olen > 1) {
      const d = [o[0] / olen, o[1] / olen];
      for (const [from, to] of [[p, a], [q, z]]) {
        c.polyline([[from[0] + d[0] * 3, from[1] + d[1] * 3], [to[0] + d[0] * 5, to[1] + d[1] * 5]], { width: 0.9, opacity: 0.7 });
      }
    }
    c.polyline([a, z], { width: 1.1 });
    const ang = Math.atan2(z[1] - a[1], z[0] - a[0]);
    c.arrowhead(a[0], a[1], ang + Math.PI);
    c.arrowhead(z[0], z[1], ang);
    growAll([a, z]);

    // Text runs along the line, upright, on the side away from the object.
    let deg = (ang * 180) / Math.PI;
    if (deg > 90) deg -= 180;
    if (deg <= -90) deg += 180;
    const t = (deg * Math.PI) / 180;
    const up = [Math.sin(t), -Math.cos(t)];
    let n = [-Math.sin(ang), Math.cos(ang)];
    const away = olen > 1 ? n[0] * o[0] + n[1] * o[1] : n[0] * up[0] + n[1] * up[1];
    if (away < 0) n = [-n[0], -n[1]];
    const gap = n[0] * up[0] + n[1] * up[1] > 0 ? 5 : 16;
    const mid = [(a[0] + z[0]) / 2 + n[0] * gap, (a[1] + z[1]) / 2 + n[1] * gap];
    text(mid[0], mid[1], str, { angle: deg });
    c.end();
  }

  function drawCallout(s) {
    const p = P(s.at);
    const q = s.to ? P(s.to) : [p[0] + 28, p[1] - 24];
    c.begin('dg-edge');
    c.polyline([p, q], { width: 1.1 });
    c.dot(p[0], p[1]);
    const right = q[0] >= p[0];
    text(q[0] + (right ? 5 : -5), q[1] + 4, s.text, { anchor: right ? 'start' : 'end' });
    growAll([p, q]);
    c.end();
  }

  if (!Number.isFinite(b.x0)) grow(0, 0);
  return { body: c.out.splice(0).join(''), bounds: b };
}

function describe(model, views) {
  const parts = [`Schematic in ${model.units}, shown as ${views.join(', ')} view${views.length > 1 ? 's' : ''}.`];
  const named = model.shapes.filter((s) => ['box', 'cylinder', 'rect'].includes(s.type) && (s.id || s.label));
  const at = (s) => `at (${s.at.map(fmt).join(', ')})`;
  for (const s of named) {
    const name = s.label || s.id;
    if (s.type === 'box') {
      const hollow = s.wall !== undefined ? `, hollow with ${fmt(s.wall)} ${model.units} walls` : '';
      const scoops = (s.scoops || []).map((sc) => `${sc.shape === 'round' ? 'round' : 'U-shaped'} scoop ${fmt(sc.width)} wide and ${fmt(sc.depth)} deep in the ${sc.side} wall`);
      parts.push(`${name}: box ${s.size.map(fmt).join(' by ')} ${model.units} ${at(s)}${hollow}${scoops.length ? `, with a ${scoops.join(' and a ')}` : ''}.`);
    }
    else if (s.type === 'cylinder') parts.push(`${name}: cylinder of radius ${fmt(s.r)} and height ${fmt(s.h)} ${model.units} ${at(s)}.`);
    else parts.push(`${name}: flat rectangle ${s.size.map(fmt).join(' by ')} ${model.units} ${at(s)}.`);
  }
  const dims = model.shapes.filter((s) => s.type === 'dim').map((s) => s.text ?? s.label ?? `${fmt(Math.hypot(...s.to.map((v, i) => v - s.from[i])))} ${model.units}`);
  if (dims.length) parts.push(`Dimensions: ${[...new Set(dims)].join(', ')}.`);
  const notes = model.shapes.filter((s) => s.type === 'label').map((s) => s.text);
  if (notes.length) parts.push(`Callouts: ${notes.join('; ')}.`);
  return parts.join(' ');
}

const SCHEMATIC_CSS =
  '.dg-node .sf{fill:var(--dg,currentColor)}.dg-node circle.tk{fill:var(--dg,currentColor)}';

/**
 * @param {string} source schematic YAML (see schema.js)
 * @param {{alt?: string, view?: string, standalone?: boolean}} [options]
 *   alt becomes <title>; a generated description becomes <desc>. view
 *   ("iso" or "plan,front,iso") overrides the source's view(s). standalone
 *   gives the SVG the code-block panel colours, for use outside the site.
 * @returns {string} an <svg> element
 */
function renderSchematic(source, options = {}) {
  const model = parse(source);
  const views = options.view ? parseViewOption(options.view) : model.views;
  const scale = model.scale || autoScale(model);
  const seed = seedFor(source, views);
  const c = new SchematicCanvas(seed);

  const cells = views.map((view) => {
    const { body, bounds: b } = drawView(model, view, scale, c);
    const fx0 = b.x0 - FRAME_PAD;
    const fy0 = b.y0 - FRAME_PAD;
    const fx1 = b.x1 + FRAME_PAD;
    const fy1 = b.y1 + FRAME_PAD;
    const frame = c.capture(() => {
      c.begin('sc-frame');
      c.crop(fx0, fy0, -1, -1);
      c.crop(fx1, fy0, 1, -1);
      c.crop(fx0, fy1, -1, 1);
      c.crop(fx1, fy1, 1, 1);
      c.caption(fx0, fy0 - 8, view.toUpperCase());
      c.end();
    });
    // The cell spans the frame plus room for crop marks and the caption.
    const left = fx0 - 10;
    const top = fy0 - 20;
    return { view, content: body + frame, left, top, w: fx1 - fx0 + 20, h: fy1 - fy0 + 30 };
  });

  const cols = Math.min(model.columns || cells.length, cells.length);
  const rows = Math.ceil(cells.length / cols);
  const colW = Array.from({ length: cols }, (_, i) => Math.max(...cells.filter((_, k) => k % cols === i).map((x) => x.w)));
  const rowH = Array.from({ length: rows }, (_, i) => Math.max(...cells.filter((_, k) => Math.floor(k / cols) === i).map((x) => x.h)));
  const colX = colW.map((_, i) => colW.slice(0, i).reduce((a, w) => a + w + CELL_GAP, 0));
  const rowY = rowH.map((_, i) => rowH.slice(0, i).reduce((a, h) => a + h + CELL_GAP, 0));

  const placed = cells.map((cell, k) => {
    const col = k % cols;
    const row = Math.floor(k / cols);
    const x = colX[col] + (colW[col] - cell.w) / 2 - cell.left;
    const y = rowY[row] + (rowH[row] - cell.h) / 2 - cell.top;
    return `<g class="sc-view" data-view="${cell.view}" transform="translate(${num(x)} ${num(y)})">${cell.content}</g>`;
  });

  const m = c.margin;
  const w = Math.ceil(colX[cols - 1] + colW[cols - 1] + 2 * m);
  const h = Math.ceil(rowY[rows - 1] + rowH[rows - 1] + 2 * m);
  const id = `schematic-${seed.toString(36)}`;
  const title = options.alt || 'Schematic';

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" class="diagram-svg diagram-technical schematic-svg" role="img" aria-labelledby="${id}-t ${id}-d"` +
    ` viewBox="${-m} ${-m} ${w} ${h}" width="${w}" height="${h}"` +
    ` style="max-width:100%;height:auto${options.standalone ? STANDALONE : ''}" ${c.root}>` +
    (options.standalone ? `<style>${STANDALONE_CSS}${SCHEMATIC_CSS}</style>` : '') +
    `<title id="${id}-t">${esc(title)}</title><desc id="${id}-d">${esc(describe(model, views))}</desc>` +
    placed.join('') +
    '</svg>'
  );
}

module.exports = { renderSchematic };
