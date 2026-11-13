// Renders diagram source to an <svg> string, either hand-drawn with rough.js
// ('sketch') or as a technical drawing ('technical', the default). Everything
// is deterministic: rough.js is seeded from a hash of the source and no DOM is
// needed, so rebuilds are byte-identical.
const { createHash } = require('crypto');
const dagre = require('@dagrejs/dagre');

const { parse } = require('./parse');
const { RoughCanvas, esc } = require('./canvas-rough');
const { TechCanvas } = require('./canvas-tech');

const PAD = 14;
const STYLES = { technical: TechCanvas, sketch: RoughCanvas };

function seedFor(source) {
  // rough.js wants a non-zero integer
  return (createHash('sha256').update(source).digest().readUInt32BE(0) % 2147483000) + 1;
}

function layoutSequence(model, c) {
  const labelW = (p) => Math.max(c.textWidth(p.label) + 2 * PAD, 90);
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
    const need = c.textWidth(m.text) + 40;
    const have = xs[hi] - xs[lo];
    if (have < need) {
      const extra = (need - have) / (hi - lo);
      for (let i = lo + 1; i < xs.length; i++) xs[i] += extra * (Math.min(i, hi) - lo);
    }
  }

  const boxH = 40;
  const top = 8 + c.topInset;
  const rowH = 46;
  const bottom = top + boxH + 20 + model.messages.length * rowH + 10;
  let width = xs[xs.length - 1] + labelW(ps[ps.length - 1]) / 2 + 10;
  for (const m of model.messages) {
    if (m.from === m.to) width = Math.max(width, xs[idx.get(m.from)] + 44 + c.textWidth(m.text) + 10);
  }
  const height = bottom + boxH + 8;

  ps.forEach((p, i) => {
    const w = labelW(p);
    c.begin('dg-life');
    c.line(xs[i], top + boxH, xs[i], bottom, true);
    c.end();
    c.tag(xs[i] - w / 2, top - 5, i + 1);
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

function nodeSize(n, c) {
  const w = c.textWidth(n.label) + 2 * PAD;
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
  g.setGraph({ rankdir: model.direction, nodesep: 40, ranksep: 70, marginx: 10, marginy: 10 + c.topInset });
  g.setDefaultEdgeLabel(() => ({}));
  for (const n of model.nodes) g.setNode(n.id, nodeSize(n, c));
  model.edges.forEach((e, i) => {
    g.setEdge(e.from, e.to, e.label ? { width: c.textWidth(e.label) + 10, height: 22, labelpos: 'c' } : {}, String(i));
  });
  dagre.layout(g);

  const info = new Map(model.nodes.map((n) => [n.id, { ...n, ...g.node(n.id) }]));

  let index = 0;
  for (const n of info.values()) {
    const { x, y, width: w, height: h, style } = n;
    c.tag(x - w / 2, y - h / 2 - 6, ++index);
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

// For an SVG viewed on its own: the code-block panel, and the same rules as in
// src/css/style.css with the palette inlined.
const STANDALONE = ';background:#0d1315;color:#d8d4bd;padding:16px;border-radius:4px';
const STANDALONE_CSS =
  '.dg-edge .ln{stroke:#92b0c2}.dg-edge .ah{fill:#92b0c2}.dg-life .ln{stroke-opacity:.45}' +
  '.dg-blue{--dg:#92b0c2}.dg-red{--dg:#f88a87}.dg-green{--dg:#8cc298}.dg-orange{--dg:#f88f00}.dg-yellow{--dg:#bab215}' +
  '.dg-node .ln,.dg-node .fl,.dg-node .pl,.dg-node .tk{stroke:var(--dg,currentColor)}.dg-node .fs,.dg-node circle.tk{fill:var(--dg)}';

/**
 * @param {string} source diagram source (see parse.js)
 * @param {{alt?: string, style?: 'technical'|'sketch', standalone?: boolean}} [options]
 *   alt becomes <title>; a generated step-by-step description becomes <desc>.
 *   style picks the drawing style (default technical). standalone gives the
 *   SVG the code-block panel colours, for use outside the site.
 * @returns {string} an <svg> element
 */
function renderDiagram(source, options = {}) {
  const style = options.style || 'technical';
  if (!STYLES[style]) throw new Error(`diagram: unknown style "${style}" (technical or sketch)`);

  const model = parse(source);
  const seed = seedFor(source);
  const c = new STYLES[style](seed);
  const size = model.type === 'sequence' ? layoutSequence(model, c) : layoutFlow(model, c);

  const m = c.margin;
  const w = Math.ceil(size.width + 2 * m);
  const h = Math.ceil(size.height + 2 * m);
  const id = `diagram-${seed.toString(36)}`;
  const title = options.alt || (model.type === 'sequence' ? 'Sequence diagram' : 'Flow diagram');

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" class="diagram-svg diagram-${style}" role="img" aria-labelledby="${id}-t ${id}-d"` +
    ` viewBox="${-m} ${-m} ${w} ${h}" width="${w}" height="${h}"` +
    ` style="max-width:100%;height:auto${options.standalone ? STANDALONE : ''}" ${c.root}>` +
    (options.standalone ? `<style>${STANDALONE_CSS}</style>` : '') +
    `<title id="${id}-t">${esc(title)}</title><desc id="${id}-d">${esc(describe(model))}</desc>` +
    c.finish() +
    '</svg>'
  );
}

module.exports = { renderDiagram, STANDALONE, STANDALONE_CSS };
