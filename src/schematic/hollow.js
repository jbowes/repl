// Geometry of hollow, open-top boxes (a box with `wall`) and the scoops cut
// into their walls. Canvas-agnostic: 3D points in model units, no drawing.
//
// A wall is described by a frame: which axis is its normal, the plane of its
// outer and inner face, and `u`, the coordinate running along it. A scoop is a
// notch cut down from the wall's top edge through its full thickness; its
// outline is sampled as a polyline in (u, dz) with dz measured down from the
// rim, so it can be mapped into any view.
const SIDES = ['+x', '-x', '+y', '-y'];
const SEGMENTS = 16;

/** Frame of the wall on `side` of a hollow box with extent `e` and thickness t. */
function wallFrame(e, t, side) {
  const [x0, y0] = e.min;
  const [x1, y1] = e.max;
  switch (side) {
    case '+y': return { side, normal: 1, along: 0, outer: y1, inner: y1 - t, start: x0, len: x1 - x0, top: e.max[2] };
    case '-y': return { side, normal: 1, along: 0, outer: y0, inner: y0 + t, start: x0, len: x1 - x0, top: e.max[2] };
    case '+x': return { side, normal: 0, along: 1, outer: x1, inner: x1 - t, start: y0, len: y1 - y0, top: e.max[2] };
    case '-x': return { side, normal: 0, along: 1, outer: x0, inner: x0 + t, start: y0, len: y1 - y0, top: e.max[2] };
    default: throw new Error(`schematic: unknown side "${side}"`);
  }
}

/** 3D point on a wall: `plane` is the normal-axis coordinate, `u` runs along the wall. */
function wallPoint(f, plane, u, z) {
  const p = [0, 0, z];
  p[f.normal] = plane;
  p[f.along] = u;
  return p;
}

/** Length of the wall on `side` for a box of size [w, d, h]. */
function wallLength(size, side) {
  return side === '+y' || side === '-y' ? size[0] : size[1];
}

/**
 * Outline of a scoop as [u, dz] pairs, left to right along the wall, from the
 * rim down the straight sides and round the bottom, back up to the rim. The
 * bottom is half an ellipse of half-width width/2 and height min(depth, width/2).
 */
function notchOutline(f, scoop) {
  const rx = scoop.width / 2;
  const ry = Math.min(scoop.depth, rx);
  const cx = f.start + scoop.at;
  const cy = -(scoop.depth - ry);
  const pts = [[cx - rx, 0]];
  if (cy < -1e-9) pts.push([cx - rx, cy]);
  for (let i = 1; i < SEGMENTS; i++) {
    const a = Math.PI + (Math.PI * i) / SEGMENTS;
    pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  pts.push([cx + rx, cy]);
  if (cy < -1e-9) pts.push([cx + rx, 0]);
  return pts;
}

/** The notch as 3D points in the wall's `plane` (outer or inner face). */
function notch3(f, plane, scoop) {
  return notchOutline(f, scoop).map(([u, dz]) => wallPoint(f, plane, u, f.top + dz));
}

/**
 * A wall face as a 3D polygon: the rectangle from uStart to uEnd and z0 to
 * the rim, with each scoop cut out of its top edge.
 */
function faceLoop(f, plane, uStart, uEnd, z0, scoops) {
  const loop = [wallPoint(f, plane, uStart, z0), wallPoint(f, plane, uEnd, z0), wallPoint(f, plane, uEnd, f.top)];
  const desc = scoops.slice().sort((a, b) => b.at - a.at);
  for (const sc of desc) loop.push(...notch3(f, plane, sc).reverse());
  loop.push(wallPoint(f, plane, uStart, f.top));
  return loop;
}

// The stretches [from, to] of a wall's rim left between its scoops, with the
// ends [lo, hi] of the stretch of rim this wall owns.
function rimRanges(f, t, scoops) {
  const lo = f.normal === 1 ? f.start : f.start + t; // +-y walls own the corners
  const hi = f.normal === 1 ? f.start + f.len : f.start + f.len - t;
  const gaps = scoops
    .map((sc) => [f.start + sc.at - sc.width / 2, f.start + sc.at + sc.width / 2])
    .sort((a, b) => a[0] - b[0]);
  const ranges = [];
  let from = lo;
  for (const [a, b] of [...gaps, [hi, hi]]) {
    if (a - from > 1e-9) ranges.push([from, a]);
    from = Math.max(from, b);
  }
  return { ranges, lo, hi };
}

/** The pieces of a wall's top surface left between its scoops, as 3D quads at rim height. */
function rimPieces(f, t, scoops) {
  return rimRanges(f, t, scoops).ranges.map(([from, to]) => [
    wallPoint(f, f.outer, from, f.top), wallPoint(f, f.outer, to, f.top),
    wallPoint(f, f.inner, to, f.top), wallPoint(f, f.inner, from, f.top),
  ]);
}

/**
 * The real edges of those pieces, as 3D line segments: the outer and inner
 * edge of the rim and the ends at a scoop. Where two walls' pieces meet at a
 * corner there is no edge, the rim is one surface.
 */
function rimEdges(f, t, scoops) {
  const { ranges, lo, hi } = rimRanges(f, t, scoops);
  const [iLo, iHi] = [f.start + t, f.start + f.len - t]; // the cavity's extent along the wall
  const edges = [];
  for (const [from, to] of ranges) {
    edges.push([wallPoint(f, f.outer, from, f.top), wallPoint(f, f.outer, to, f.top)]);
    const [a, b] = [Math.max(from, iLo), Math.min(to, iHi)];
    if (b - a > 1e-9) edges.push([wallPoint(f, f.inner, a, f.top), wallPoint(f, f.inner, b, f.top)]);
    for (const u of [from, to]) {
      if (u - lo > 1e-9 && hi - u > 1e-9) edges.push([wallPoint(f, f.outer, u, f.top), wallPoint(f, f.inner, u, f.top)]);
    }
  }
  return edges;
}

/**
 * The cut surface of a scoop (its sides and bottom, through the wall's
 * thickness) as a 3D band between the outer and inner outlines.
 */
function cutBand(f, scoop) {
  return [...notch3(f, f.outer, scoop), ...notch3(f, f.inner, scoop).reverse()];
}

module.exports = { SIDES, wallFrame, wallPoint, wallLength, notchOutline, notch3, faceLoop, rimPieces, rimEdges, cutBand };
