// The hand-drawn canvas: every shape goes through rough.js, seeded so output
// is a pure function of the diagram source.
const { groupColour } = require('./palette');
const roughModule = require('roughjs');
// The CJS build exports `generator` directly; webpack picks the ESM build,
// which hangs it off the default export.
const rough = roughModule.default || roughModule;

const FONT = "'Segoe Print', 'Bradley Hand', 'Chalkboard SE', 'Comic Neue', 'Comic Sans MS', cursive, sans-serif";
// Marks rough.js fill strokes so they can be told apart from outlines (see
// RoughCanvas.drawable); it never reaches the output.
const FILL_MARK = '#f0f';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const num = (n) => Math.round(n * 10) / 10;

class RoughCanvas {
  constructor(seed) {
    this.fontSize = 16;
    this.charW = 8.2; // rough per-character width for FONT
    this.topInset = 0;
    this.margin = 4;
    this.root = `fill="none" stroke-linecap="round" stroke-linejoin="round" font-family="${esc(FONT)}" font-size="16"`;
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
    // Without the page's CSS, `color` is what currentColor falls back to.
    const fallback = groupColour(cls, style);
    this.out.push(`<g class="${cls}${colour}"${fallback ? ` color="${fallback}"` : ''}>`);
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

  textWidth(s) {
    return s.length * this.charW;
  }

  // Index tags are a technical-drawing detail.
  tag() {}

  finish() {
    return this.out.join('');
  }
}

module.exports = { RoughCanvas, esc, num };
