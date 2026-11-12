// The technical-drawing canvas: precise thin lines, chamfered panels with an
// inset panel line and crop marks, hatch fills, dash-dot centre lines, solid
// arrowheads, monospace labels and small index tags. No randomness at all.
const FONT = "ui-monospace, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";
const STROKE = 1.5;
const HATCH_GAP = 6;
// Long dash, gap, dot, gap: the centre-line convention of technical drawings.
const CENTRE_LINE = '12 4 2 4';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const num = (n) => Math.round(n * 10) / 10;
const pts = (points) => points.map(([x, y]) => `${num(x)},${num(y)}`).join(' ');

class TechCanvas {
  constructor(seed) {
    this.id = `t${seed.toString(36)}`;
    this.fontSize = 13;
    this.charW = 8.2; // per character at 13px, with the letter spacing below
    this.topInset = 14; // room for index tags above the first row
    this.margin = 12; // room for crop marks
    this.root = `fill="none" stroke-linecap="butt" stroke-linejoin="miter" font-family="${esc(FONT)}" font-size="13" letter-spacing=".3"`;
    this.n = 0;
    this.out = [];
  }

  textWidth(s) {
    return s.length * this.charW;
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

  stroke(cls, d, extra = '') {
    this.out.push(`<path class="${cls}" d="${d}" stroke="currentColor"${extra}/>`);
  }

  // Hatch, cross-hatch or tint inside a shape. `shape(attrs)` returns the
  // shape's element markup; it is used once as a clip and once for solid fills.
  fill(shape, box, style) {
    if (!style) return;
    if (style.fill === 'solid') {
      this.out.push(shape('class="fs" fill="currentColor" fill-opacity=".25" stroke="none"'));
      return;
    }
    const id = `${this.id}-${this.n++}`;
    const { x, y, w, h } = box;
    let d = '';
    for (let o = -h; o <= w; o += HATCH_GAP) d += `M${num(x + o)},${num(y + h)}L${num(x + o + h)},${num(y)}`;
    if (style.fill === 'cross-hatch') {
      for (let o = 0; o <= w + h; o += HATCH_GAP) d += `M${num(x + o)},${num(y + h)}L${num(x + o - h)},${num(y)}`;
    }
    this.out.push(
      `<clipPath id="${id}">${shape('')}</clipPath>` +
      `<path class="fl" clip-path="url(#${id})" d="${d}" stroke="currentColor" stroke-opacity=".5" stroke-width=".9"/>`
    );
  }

  // Crop marks: a short pair of lines just outside a corner.
  crop(x, y, sx, sy) {
    this.stroke('tk', `M${num(x + sx * 3)},${num(y)}h${sx * 6}M${num(x)},${num(y + sy * 3)}v${sy * 6}`, ' stroke-width=".9"');
  }

  line(x1, y1, x2, y2, dashed) {
    this.path([[x1, y1], [x2, y2]], dashed);
  }

  path(points, dashed) {
    const d = 'M' + points.map(([x, y]) => `${num(x)},${num(y)}`).join('L');
    this.stroke('ln', d, ` stroke-width="${STROKE}"${dashed ? ` stroke-dasharray="${CENTRE_LINE}"` : ''}`);
  }

  // A rectangle with its top-left and bottom-right corners cut.
  rect(x, y, w, h, style) {
    const c = Math.min(10, h / 3);
    const poly = (inset, cut) => [
      [x + inset + cut, y + inset], [x + w - inset, y + inset], [x + w - inset, y + h - inset - cut],
      [x + w - inset - cut, y + h - inset], [x + inset, y + h - inset], [x + inset, y + inset + cut],
    ];
    const outline = poly(0, c);
    this.fill((a) => `<polygon points="${pts(outline)}" ${a}/>`, { x, y, w, h }, style);
    this.out.push(`<polygon class="ln" points="${pts(outline)}" stroke="currentColor" stroke-width="${STROKE}"/>`);
    this.out.push(`<polygon class="pl" points="${pts(poly(4, Math.max(c - 4, 2)))}" stroke="currentColor" stroke-opacity=".4" stroke-width=".8"/>`);
    this.crop(x + w, y, 1, -1);
    this.crop(x, y + h, -1, 1);
  }

  // A ring with an inner ring and four tick marks, like a gauge.
  ellipse(cx, cy, w, h, style) {
    const rx = w / 2;
    const ry = h / 2;
    const el = (rx2, ry2, a) => `<ellipse cx="${num(cx)}" cy="${num(cy)}" rx="${num(rx2)}" ry="${num(ry2)}" ${a}/>`;
    this.fill((a) => el(rx, ry, a), { x: cx - rx, y: cy - ry, w, h }, style);
    this.out.push(el(rx, ry, `class="ln" stroke="currentColor" stroke-width="${STROKE}"`));
    this.out.push(el(rx - 4, ry - 4, 'class="pl" stroke="currentColor" stroke-opacity=".4" stroke-width=".8"'));
    this.stroke('tk', `M${num(cx - rx - 8)},${num(cy)}h6M${num(cx + rx + 2)},${num(cy)}h6M${num(cx)},${num(cy - ry - 8)}v6M${num(cx)},${num(cy + ry + 2)}v6`, ' stroke-width=".9"');
  }

  // A diamond, or any polygon, with an inset copy and a dot on each vertex.
  polygon(points, style) {
    const cx = points.reduce((a, p) => a + p[0], 0) / points.length;
    const cy = points.reduce((a, p) => a + p[1], 0) / points.length;
    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    const box = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
    this.fill((a) => `<polygon points="${pts(points)}" ${a}/>`, box, style);
    this.out.push(`<polygon class="ln" points="${pts(points)}" stroke="currentColor" stroke-width="${STROKE}"/>`);
    const inner = points.map(([x, y]) => [cx + (x - cx) * 0.84, cy + (y - cy) * 0.84]);
    this.out.push(`<polygon class="pl" points="${pts(inner)}" stroke="currentColor" stroke-opacity=".4" stroke-width=".8"/>`);
    for (const [x, y] of points) this.out.push(`<circle class="tk" cx="${num(x)}" cy="${num(y)}" r="1.9" fill="currentColor" stroke="none"/>`);
  }

  // A solid triangle whose tip is at (x, y).
  arrowhead(x, y, angle) {
    const len = 11;
    const half = 4.2;
    const bx = x - len * Math.cos(angle);
    const by = y - len * Math.sin(angle);
    const nx = -Math.sin(angle) * half;
    const ny = Math.cos(angle) * half;
    this.out.push(`<path class="ah" d="M${num(x)},${num(y)}L${num(bx + nx)},${num(by + ny)}L${num(bx - nx)},${num(by - ny)}Z" fill="currentColor" stroke="none"/>`);
  }

  text(x, y, str, anchor = 'middle') {
    this.out.push(
      `<text x="${num(x)}" y="${num(y)}" text-anchor="${anchor}" fill="currentColor" stroke="none">${esc(str)}</text>`
    );
  }

  // A small index number, like the callouts on an exploded drawing.
  tag(x, y, n) {
    this.out.push(
      `<text class="tag" x="${num(x)}" y="${num(y)}" font-size="9" letter-spacing="1" fill="currentColor" fill-opacity=".55" stroke="none">${String(n).padStart(2, '0')}</text>`
    );
  }

  finish() {
    return this.out.join('');
  }
}

module.exports = { TechCanvas };
