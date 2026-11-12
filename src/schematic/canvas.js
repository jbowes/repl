// TechCanvas plus what schematics need: shaded faces, opaque backing so nearer
// solids hide farther ones, text with a halo, and dimension-line pieces.
// Diagrams keep using TechCanvas untouched.
const { TechCanvas } = require('../diagram/canvas-tech');

const HATCH_GAP = 6;
const STROKE = 1.5;
const DASH = '12 4 2 4'; // dash-dot, as TechCanvas centre lines
const BG = '#0d1315'; // fallback; the site stylesheet uses var(--code-bg)

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const num = (n) => Math.round(n * 10) / 10;
const pts = (points) => points.map(([x, y]) => `${num(x)},${num(y)}`).join(' ');

// Fill strengths per face. `flat` is a face seen square on (plan, elevations);
// `top`, `left` (the +y face) and `right` (the +x face) fade in that order so
// an iso box reads as lit from above and the left (the panel is dark, so more
// tint is brighter).
const TINT = {
  hatch: { flat: 0, top: 0.2, left: 0.11, right: 0.04 },
  solid: { flat: 0.25, top: 0.45, left: 0.3, right: 0.16 },
  plain: { flat: 0, top: 0.1, left: 0.05, right: 0 },
};
const HATCH = { flat: 0.5, top: 0.55, left: 0.42, right: 0.3 };

class SchematicCanvas extends TechCanvas {
  /** Swaps in a fresh output buffer, returning what was drawn into the old one. */
  capture(draw) {
    const saved = this.out;
    this.out = [];
    draw();
    const drawn = this.out.join('');
    this.out = saved;
    return drawn;
  }

  raw(markup) {
    this.out.push(markup);
  }

  // Opaque backing in the panel colour, so what is behind does not show through.
  backing(shape) {
    this.out.push(shape(`class="sb" fill="${BG}" stroke="none"`));
  }

  // Tint plus hatching for one face. `shape(attrs)` returns the element markup.
  shade(shape, box, style, face) {
    const kind = !style ? 'plain' : style.fill === 'solid' ? 'solid' : 'hatch';
    const tint = TINT[kind][face];
    if (tint) this.out.push(shape(`class="sf" fill="currentColor" fill-opacity="${tint}" stroke="none"`));
    if (kind === 'hatch' && style) {
      const id = `${this.id}-${this.n++}`;
      const { x, y, w, h } = box;
      let d = '';
      for (let o = -h; o <= w; o += HATCH_GAP) d += `M${num(x + o)},${num(y + h)}L${num(x + o + h)},${num(y)}`;
      if (style.fill === 'cross-hatch') {
        for (let o = 0; o <= w + h; o += HATCH_GAP) d += `M${num(x + o)},${num(y + h)}L${num(x + o - h)},${num(y)}`;
      }
      this.out.push(
        `<clipPath id="${id}">${shape('')}</clipPath>` +
        `<path class="fl" clip-path="url(#${id})" d="${d}" stroke="currentColor" stroke-opacity="${HATCH[face]}" stroke-width=".9"/>`
      );
    }
  }

  polygon2(points, { dashed, opacity } = {}) {
    const extra = (dashed ? ` stroke-dasharray="${DASH}"` : '') + (opacity ? ` stroke-opacity="${opacity}"` : '');
    this.out.push(`<polygon class="ln" points="${pts(points)}" stroke="currentColor" stroke-width="${STROKE}"${extra}/>`);
  }

  // A polyline with optional dash-dot and opacity (hidden edges).
  polyline(points, { dashed, opacity, closed, width = STROKE, cls = 'ln' } = {}) {
    const d = 'M' + points.map(([x, y]) => `${num(x)},${num(y)}`).join('L') + (closed ? 'Z' : '');
    const extra = ` stroke-width="${width}"` + (dashed ? ` stroke-dasharray="${DASH}"` : '') + (opacity ? ` stroke-opacity="${opacity}"` : '');
    this.stroke(cls, d, extra);
  }

  // Centred text, optionally rotated about its anchor, with a panel-colour halo
  // so hatching never runs through the letters.
  halo(x, y, str, { anchor = 'middle', angle = 0 } = {}) {
    const rot = angle ? ` transform="rotate(${num(angle)} ${num(x)} ${num(y)})"` : '';
    this.out.push(
      `<text class="ht" x="${num(x)}" y="${num(y)}" text-anchor="${anchor}"${rot} fill="currentColor" stroke="${BG}" stroke-width="4" stroke-linejoin="round" paint-order="stroke">${esc(str)}</text>`
    );
  }

  dot(x, y) {
    this.out.push(`<circle class="tk" cx="${num(x)}" cy="${num(y)}" r="2" fill="currentColor" stroke="none"/>`);
  }

  // A small caption above a drawing, like the title of a sheet view.
  caption(x, y, str) {
    this.out.push(
      `<text class="tag" x="${num(x)}" y="${num(y)}" font-size="10" letter-spacing="1.5" fill="currentColor" fill-opacity=".6" stroke="none">${esc(str)}</text>`
    );
  }
}

module.exports = { SchematicCanvas, esc, num };
