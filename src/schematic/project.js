// Projection, extents and painter's-order sorting. Canvas-agnostic: everything
// here is plain numbers in model units; the renderer multiplies by `scale`.
//
// Axes: x right, y toward the viewer in plan (down the page), z up. The viewer
// of an iso drawing stands at +x, +y, +z, so the +y face is the left face, the
// +x face the right face. `front` looks from +y (x right, z up), `side` from +x
// (y right, z up), `plan` from +z (x right, y down). `section` is `front` with
// the model cut at a plane y = const and the near half removed.
const COS30 = Math.cos(Math.PI / 6);
const SIN30 = 0.5;

// The axes the viewer looks along; a solid whose extent ends before another's
// starts on one of these is behind it.
const VIEW_AXES = { plan: [2], front: [1], section: [1], side: [0], iso: [0, 1, 2] };

/** Screen position in model units, y down the page. */
function project([x, y, z], view) {
  switch (view) {
    case 'plan': return [x, y];
    case 'front':
    case 'section': return [x, -z];
    case 'side': return [y, -z];
    case 'iso': return [(x - y) * COS30, (x + y) * SIN30 - z];
    default: throw new Error(`schematic: unknown view "${view}"`);
  }
}

/** Min and max corners of a solid (box, cylinder or flat rect). */
function extent(s) {
  if (s.type === 'box') return { min: s.at, max: s.at.map((v, i) => v + s.size[i]) };
  if (s.type === 'cylinder') return { min: [s.at[0] - s.r, s.at[1] - s.r, s.at[2]], max: [s.at[0] + s.r, s.at[1] + s.r, s.at[2] + s.h] };
  if (s.type === 'rect') return { min: s.at, max: [s.at[0] + s.size[0], s.at[1] + s.size[1], s.at[2]] };
  return null;
}

/** True when `a` can be hidden by `b`, going by a separating plane that has the viewer on b's side. */
function behind(a, b, view) {
  return VIEW_AXES[view].some((i) => a.max[i] <= b.min[i]);
}

/**
 * Orders solids back to front for painting. For axis-aligned, non-intersecting
 * solids a separating plane always decides the order, so this is exact (a
 * topological sort over "is behind" relations). Intersecting solids, or cyclic
 * overlaps, fall back to input order.
 */
function paintOrder(solids, view) {
  const ext = solids.map(extent);
  const state = new Array(solids.length).fill(0);
  const out = [];
  const visit = (i) => {
    if (state[i]) return;
    state[i] = 1;
    for (let j = 0; j < solids.length; j++) {
      if (j !== i && behind(ext[j], ext[i], view) && !behind(ext[i], ext[j], view)) visit(j);
    }
    out.push(solids[i]);
  };
  solids.forEach((_, i) => visit(i));
  return out;
}

/** Ellipse a horizontal circle of radius r projects to in iso: [rx, ry] in model units. */
function isoCircle(r) {
  return [r * COS30 * Math.SQRT2, r * SIN30 * Math.SQRT2];
}

/** Every 3D point a shape occupies, for fitting the default scale. */
function points(s) {
  const e = extent(s);
  if (e) return [e.min, e.max];
  if (s.type === 'line') return s.points;
  if (s.type === 'dim') return [s.from, s.to];
  return [];
}

module.exports = { project, extent, paintOrder, behind, isoCircle, points, COS30, SIN30, VIEW_AXES };
