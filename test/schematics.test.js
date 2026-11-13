// Schematic source, projection and rendering (src/schematic).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { parse } = require('../src/schematic/schema');
const { project, paintOrder, isoCircle } = require('../src/schematic/project');
const { renderSchematic } = require('../src/schematic/render');

const fixture = (name) => fs.readFileSync(path.join(__dirname, 'fixtures', name), 'utf8');
const ENCL = fixture('enclosure.schematic.yaml');
const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);

test('plan drops z, elevations drop an axis', () => {
  assert.deepEqual(project([3, 4, 5], 'plan'), [3, 4]);
  assert.deepEqual(project([3, 4, 5], 'front'), [3, -5]);
  assert.deepEqual(project([3, 4, 5], 'side'), [4, -5]);
});

test('iso projection is 30 degrees: sx=(x-y)cos30, sy=(x+y)sin30-z', () => {
  const c = Math.cos(Math.PI / 6);
  const [sx, sy] = project([10, 4, 3], 'iso');
  near(sx, 6 * c);
  near(sy, 7 - 3);
  // an x step goes down-right at 30 degrees, a y step down-left, z straight up
  const o = project([0, 0, 0], 'iso');
  const dx = project([1, 0, 0], 'iso');
  near(Math.atan2(dx[1] - o[1], dx[0] - o[0]), Math.PI / 6);
  const dy = project([0, 1, 0], 'iso');
  near(Math.atan2(dy[1] - o[1], dy[0] - o[0]), Math.PI - Math.PI / 6);
  assert.deepEqual(project([0, 0, 1], 'iso'), [0, -1]);
});

test('a horizontal circle projects to an ellipse in iso', () => {
  const [rx, ry] = isoCircle(10);
  near(rx, 10 * Math.cos(Math.PI / 6) * Math.SQRT2);
  near(ry, 10 * 0.5 * Math.SQRT2);
});

test('unknown views are errors', () => {
  assert.throws(() => project([0, 0, 0], 'top'), /unknown view/);
  assert.throws(() => renderSchematic(ENCL, { view: 'top' }), /view: expected a list of plan, front, side, section, iso/);
});

const box = (id, at, size) => ({ type: 'box', id, at, size });

test('painter order draws far solids first in iso', () => {
  const near_ = box('near', [20, 20, 0], [10, 10, 10]);
  const far = box('far', [0, 0, 0], [10, 10, 10]);
  const high = box('high', [0, 0, 10], [10, 10, 10]);
  const ids = (list) => paintOrder(list, 'iso').map((s) => s.id);
  assert.deepEqual(ids([near_, far]), ['far', 'near']);
  assert.deepEqual(ids([far, near_]), ['far', 'near']);
  // the upper box covers the lower one's top face
  assert.deepEqual(ids([high, far]), ['far', 'high']);
  // along +x or +y, larger values are nearer
  assert.deepEqual(ids([box('b', [0, 10, 0], [10, 10, 10]), box('a', [0, 0, 0], [10, 10, 10])]), ['a', 'b']);
});

test('painter order follows the view direction', () => {
  const low = box('low', [0, 0, 0], [10, 10, 5]);
  const up = box('up', [0, 0, 5], [10, 10, 5]);
  assert.deepEqual(paintOrder([up, low], 'plan').map((s) => s.id), ['low', 'up']);
  const back = box('back', [0, 0, 0], [10, 10, 10]);
  const front = box('front', [0, 10, 0], [10, 10, 10]);
  assert.deepEqual(paintOrder([front, back], 'front').map((s) => s.id), ['back', 'front']);
  assert.deepEqual(paintOrder([front, back], 'side').map((s) => s.id), ['front', 'back']);
});

test('iso faces are shaded differently: top, left and right', () => {
  const svg = renderSchematic('shapes:\n  - { type: box, at: [0, 0, 0], size: [10, 10, 10], style: blue-solid }', { view: 'iso' });
  const opacities = [...svg.matchAll(/class="sf" fill="currentColor" fill-opacity="([\d.]+)"/g)].map((m) => Number(m[1]));
  assert.equal(opacities.length, 3);
  assert.equal(new Set(opacities).size, 3);
});

test('styles, units, scale and a generated description', () => {
  const svg = renderSchematic(
    'units: cm\nscale: 5\nshapes:\n  - { type: box, id: crate, at: [0, 0], size: [10, 20, 30], style: red-cross }\n  - { type: dim, from: [0, 0], to: [10, 0], offset: [0, -3] }',
    { alt: 'A crate', view: 'plan' }
  );
  assert.match(svg, /<title id="[^"]+">A crate<\/title>/);
  assert.match(svg, /<desc [^>]*>[^<]*crate: box 10 by 20 by 30 cm/);
  assert.match(svg, /<g class="dg-node dg-red">/);
  assert.match(svg, />10 cm<\/text>/);
});

test('primitives: cylinder, rect, line and group render in every view', () => {
  const src = fixture('tank-and-pipe.schematic.yaml');
  for (const v of ['plan', 'front', 'side', 'iso']) {
    const svg = renderSchematic(src, { view: v });
    assert.match(svg, /^<svg /);
    assert.doesNotMatch(svg, /NaN|undefined|Infinity/);
  }
  const m = parse(src);
  const tank = m.shapes.find((s) => s.id === 'tank');
  assert.deepEqual(tank.at, [40, 40, 0]); // group offset applied
  assert.deepEqual(tank.style, { color: 'green', fill: 'hachure' }); // group style inherited
});

test('hidden edges are dash-dot at low opacity', () => {
  const svg = renderSchematic('shapes:\n  - { type: box, at: [0, 0, 0], size: [10, 10, 10], hidden: true }', { view: 'iso' });
  assert.equal((svg.match(/stroke-dasharray="12 4 2 4" stroke-opacity="0.4"/g) || []).length, 3);
});

test('errors name the field path', () => {
  const bad = (yaml, re) => assert.throws(() => parse(yaml), re);
  bad('shapes:\n  - { type: sphere }', /shapes\[0\]\.type: unknown primitive "sphere"/);
  bad('shapes:\n  - { type: box, at: [0, 0, 0] }', /shapes\[0\]\.size: is required/);
  bad('shapes:\n  - { type: box, at: [0, 0, 0], size: [1, 2] }', /shapes\[0\]\.size: expected \[w, d, h\]/);
  bad('shapes:\n  - { type: box, at: [0, 0, 0], size: [1, 2, 0] }', /shapes\[0\]\.size: expected \[w, d, h\] of positive/);
  bad('shapes:\n  - { type: box, at: [0, 0, 0], size: [1, 2, 3], style: purple }', /shapes\[0\]\.style: unknown style "purple"/);
  bad('shapes:\n  - { type: box, at: [0, 0, 0], size: [1, 2, 3], style: blue-dotted }', /shapes\[0\]\.style: unknown style/);
  bad('shapes:\n  - { type: box, at: [0, x, 0], size: [1, 2, 3] }', /shapes\[0\]\.at: expected a point/);
  bad('shapes:\n  - { type: box, at: [0, 0, 0], size: [1, 2, 3], colour: red }', /shapes\[0\]\.colour: unknown field for box/);
  bad('shapes:\n  - { type: line, points: [[0, 0]] }', /shapes\[0\]\.points: expected at least two points/);
  bad('shapes:\n  - type: group\n    shapes:\n      - { type: cylinder, at: [0, 0], r: 1 }', /shapes\[0\]\.shapes\[0\]\.h: is required/);
  bad('shapes:\n  - { type: box, id: a, at: [0, 0], size: [1, 1, 1] }\n  - { type: box, id: a, at: [0, 0], size: [1, 1, 1] }', /shapes\[1\]\.id: duplicate id "a"/);
  bad('shapes: []', /shapes: expected a non-empty list/);
  bad('views: [plan]\nview: iso\nshapes:\n  - { type: label, at: [0, 0], text: x }', /use either `view` or `views`/);
  bad('units: mm\nsahpes: []', /sahpes: unknown field/);
  bad('shapes:\n  - { type: label, at: [0, 0], text: x, views: [top] }', /shapes\[0\]\.views: expected a list of plan, front, side, section, iso/);
  bad('shapes: [', /invalid YAML/);
});

test('aliases: plane is rect, wire is line', () => {
  const m = parse('shapes:\n  - { type: plane, at: [0, 0], size: [5, 5] }\n  - { type: wire, points: [[0, 0], [1, 1]] }');
  assert.deepEqual(m.shapes.map((s) => s.type), ['rect', 'line']);
});

test('rendering is deterministic and the fixtures render', () => {
  assert.equal(renderSchematic(ENCL), renderSchematic(ENCL));
  assert.notEqual(renderSchematic(ENCL, { view: 'iso' }), renderSchematic(ENCL, { view: 'plan' }));
  const svg = renderSchematic(ENCL, { alt: 'Enclosure' });
  assert.match(svg, /<text [^>]*>120 mm<\/text>/);
  assert.match(svg, /Callouts: [^<]*cubby/);
});

test('standalone output embeds the palette CSS', () => {
  const svg = renderSchematic(ENCL, { standalone: true });
  assert.match(svg, /<style>.*\.dg-blue\{--dg:#92b0c2\}/);
  assert.match(svg, /\.dg-node \.sf\{/);
});

const HOLLOW = 'views: [plan, section, iso]\nshapes:\n  - { type: box, at: [0, 0, 0], size: [100, 80, 60], wall: 4, floor: 20, style: blue }\n';

test('a hollow box takes wall and an optional floor, defaulting to the wall', () => {
  const [s] = parse(HOLLOW).shapes;
  assert.deepEqual([s.wall, s.floor], [4, 20]);
  const [d] = parse('shapes:\n  - { type: box, at: [0, 0, 0], size: [100, 80, 60], wall: 4 }\n').shapes;
  assert.equal(d.floor, 4);
});

test('hollow box validation names the field', () => {
  const bad = (box) => parse(`shapes:\n  - { type: box, at: [0, 0, 0], size: [100, 80, 60], ${box} }\n`);
  assert.throws(() => bad('wall: 40'), /shapes\[0\]\.wall: must be less than half/);
  assert.throws(() => bad('wall: 4, floor: 60'), /shapes\[0\]\.floor: must be less than h/);
  assert.throws(() => bad('floor: 4'), /shapes\[0\]\.floor: needs wall/);
  assert.throws(() => bad('wall: -1'), /shapes\[0\]\.wall/);
});

test('plan draws a hatched rim around an empty cavity', () => {
  const svg = renderSchematic(HOLLOW, { view: 'plan' });
  // the rim is an even-odd ring, so the cavity is not filled or hatched
  assert.match(svg, /fill-rule="evenodd"/);
  assert.equal((svg.match(/<polygon class="ln"/g) || []).length, 2); // outer and inner outline
});

test('section hatches only the cut walls and floor, as a U', () => {
  const svg = renderSchematic(HOLLOW, { view: 'section' });
  const u = /<polygon class="ln" points="([^"]+)"/.exec(svg)[1].split(' ');
  assert.equal(u.length, 8); // outer sides and floor, then back up the inner sides
  assert.ok(!svg.includes('fill-rule="evenodd"'));
});

test('section removes solids wholly on the viewer side of the cut', () => {
  const src = (cut) => `views: [section]\n${cut}shapes:\n  - { type: box, id: back, at: [0, 0, 0], size: [10, 10, 10] }\n  - { type: box, id: front, at: [0, 20, 0], size: [10, 10, 10], style: red }\n`;
  // the middle is y = 15, so the red box (y 20 to 30) is on the removed half
  assert.ok(!renderSchematic(src('')).includes('dg-red'));
  assert.ok(renderSchematic(src('cut: 25\n')).includes('dg-red')); // the cut plane moved behind the front box
});

test('iso draws the inside of a hollow box: floor and two inner walls, then a rim', () => {
  const hollow = renderSchematic(HOLLOW, { view: 'iso' });
  const solid = renderSchematic('views: [iso]\nshapes:\n  - { type: box, at: [0, 0, 0], size: [100, 80, 60], style: blue }\n');
  const polys = (svg) => (svg.match(/<polygon class="ln"/g) || []).length;
  assert.equal(polys(solid), 3);
  assert.equal(polys(hollow), 3 + 3 + 1); // faces + inside + the rim's inner edge
  assert.match(hollow, /fill-rule="evenodd"/);
});

const TRAY = (scoops, extra = '') =>
  `views: [plan, front, side, section, iso]\nshapes:\n  - { type: box, id: tray, at: [0, 0, 0], size: [70, 60, 30], wall: 3, style: yellow, ${extra}scoops: ${scoops} }\n`;
const U = '[{ side: +x, at: 30, width: 20, depth: 12 }]';
// the first full-strength outline (lowered wall parts are fainter)
const firstOutline = (svg) => /<polygon class="ln" points="([^"]+)" stroke="currentColor" stroke-width="1.5"\/>/.exec(svg)[1].split(' ').map((p) => p.split(',').map(Number));

test('scoops are parsed per wall: u or round, depth for round is width/2', () => {
  const [s] = parse(TRAY('[{ side: +x, at: 30, width: 20, depth: 12 }, { side: -y, at: 35, width: 24, shape: round }]')).shapes;
  assert.deepEqual(s.scoops, [
    { side: '+x', at: 30, width: 20, depth: 12, shape: 'u' },
    { side: '-y', at: 35, width: 24, depth: 12, shape: 'round' },
  ]);
});

test('scoop validation names the field', () => {
  const bad = (scoops, re) => assert.throws(() => parse(TRAY(scoops)), re);
  bad('[{ side: up, at: 30, width: 20, depth: 12 }]', /shapes\[0\]\.scoops\[0\]\.side: unknown side "up"/);
  bad('[{ side: +x, width: 20, depth: 12 }]', /scoops\[0\]\.at: is required/);
  bad('[{ side: +x, at: 30, depth: 12 }]', /scoops\[0\]\.width: is required/);
  bad('[{ side: +x, at: 30, width: 20 }]', /scoops\[0\]\.depth: is required/);
  bad('[{ side: +x, at: 30, width: 20, depth: 12, shape: v }]', /scoops\[0\]\.shape: unknown shape "v"/);
  bad('[{ side: +x, at: 30, width: 20, depth: 12, colour: x }]', /scoops\[0\]\.colour: unknown field for a scoop/);
  bad('[{ side: +x, at: 30, width: 20, shape: round, depth: 5 }]', /scoops\[0\]\.depth: a round scoop is a semicircle/);
  // wider than the +x wall (60 long, less 3 at each end)
  bad('[{ side: +x, at: 30, width: 56, depth: 12 }]', /scoops\[0\]: scoop does not fit in the \+x wall/);
  bad('[{ side: +x, at: 5, width: 20, depth: 12 }]', /scoops\[0\]: scoop does not fit/);
  // deeper than the wall is tall (30 high, 3 of floor)
  bad('[{ side: +x, at: 30, width: 20, depth: 28 }]', /scoops\[0\]\.depth: 28 is deeper than the wall is tall \(27/);
  bad('[{ side: +x, at: 25, width: 20, depth: 12 }, { side: +x, at: 35, width: 20, depth: 12 }]', /scoops\[1\]: overlaps scoops\[0\]/);
  assert.throws(() => parse('shapes:\n  - { type: box, at: [0, 0, 0], size: [10, 10, 10], scoops: [] }'), /shapes\[0\]\.scoops: needs `wall`/);
});

const LOWERED = /<polygon class="ln" points="[^"]+" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.55"\/>/g;

test('plan splits the hatched rim at each scoop and draws the lowered wall darker', () => {
  const two = TRAY('[{ side: +x, at: 30, width: 20, depth: 12 }, { side: -x, at: 30, width: 20, depth: 12 }]');
  const all = (src) => (renderSchematic(src, { view: 'plan' }).match(/<polygon class="ln"/g) || []).length;
  const lowered = (src) => (renderSchematic(src, { view: 'plan' }).match(LOWERED) || []).length;
  // the rim is stroked edge by edge, so the only polygons are the walls under the scoops
  assert.equal(all(TRAY(U)), 1);
  assert.equal(lowered(TRAY(U)), 1);
  assert.equal(all(two), 2);
  assert.equal(lowered(two), 2);
  // the lowered part is tinted, not hatched like the rim
  assert.match(renderSchematic(TRAY(U), { view: 'plan' }), /class="sf" fill="currentColor" fill-opacity="0.16"/);
});

test('the elevation facing a scoop shows its notch in the wall outline', () => {
  const points = (view, scoops) => firstOutline(renderSchematic(TRAY(scoops), { view })).length;
  assert.equal(points('side', '[]'), 4);
  assert.ok(points('side', U) > 10); // the +x wall faces the side view
  assert.equal(points('front', U), 4); // seen edge on from the front: no change
});

test('a section through a scoop lowers the cut wall', () => {
  const only = (scoops) => TRAY(scoops).replace('views: [plan, front, side, section, iso]', 'views: [section]');
  const top = (scoops) => Math.min(...firstOutline(renderSchematic(only(scoops))).map((p) => p[1]));
  const bottom = (scoops) => Math.max(...firstOutline(renderSchematic(only(scoops))).map((p) => p[1]));
  const left = '{ side: -x, at: 30, width: 20, depth: 12 }';
  const right = '{ side: +x, at: 30, width: 20, depth: 12 }';
  const height = bottom('[]') - top('[]');
  // one wall still reaches the rim, so the outline's height is unchanged
  assert.ok(Math.abs(bottom(`[${left}]`) - top(`[${left}]`) - height) < 0.2);
  // cut through the scoop, the walls are lower: both lowered -> the section is shorter by the depth
  const both = bottom(`[${left}, ${right}]`) - top(`[${left}, ${right}]`);
  assert.ok(Math.abs(height - both - 12 * (height / 30)) < 0.3, `${height} ${both}`);
  // the wall past the cut still shows at full height, fainter, above each lowered top
  const faint = (scoops) => (renderSchematic(only(scoops)).match(LOWERED) || []).length;
  assert.deepEqual([faint('[]'), faint(`[${left}]`), faint(`[${left}, ${right}]`)], [0, 1, 2]);
});

test('iso draws the scoop notch, its cut surface and the gap in the rim', () => {
  const svg = renderSchematic(TRAY('[{ side: +x, at: 30, width: 20, depth: 12 }, { side: -x, at: 30, width: 20, depth: 12 }]'), { view: 'iso' });
  assert.doesNotMatch(svg, /NaN|undefined/);
  const polys = (svg.match(/<polygon class="ln"/g) || []).length;
  // 3 inside faces, 2 outer faces, 2 cut bands; the rim is stroked as edges
  assert.equal(polys, 3 + 2 + 2);
});

test('the rim has no seam where walls meet: only outer, inner and scoop edges', () => {
  const { wallFrame, rimEdges } = require('../src/schematic/hollow');
  const e = { min: [0, 0, 0], max: [70, 60, 30] };
  const t = 3;
  const scoop = { side: '+x', at: 30, width: 20, depth: 12 };
  const edges = ['+x', '-x', '+y', '-y'].flatMap((side) => rimEdges(wallFrame(e, t, side), t, side === '+x' ? [scoop] : []));
  // +y, -y and -x: an outer and an inner edge each. +x, in two pieces: two of
  // each, and an end at each side of the scoop. The +y and -y walls own the
  // corners, so each also closes the outer face at its two ends.
  assert.equal(edges.length, 3 * 2 + (2 * 2 + 2) + 4);
  const across = edges.filter(([a, b]) => a[0] !== b[0] && a[1] !== b[1]);
  assert.equal(across.length, 0); // nothing diagonal
  // the edges that cross the +x wall's thickness are the scoop's two ends, at y 20 and 40
  const crossing = edges.filter(([a, b]) => Math.abs(a[0] - b[0]) === t && a[1] === b[1]);
  assert.deepEqual(crossing.map(([a]) => a[1]).sort((x, y) => x - y), [20, 40]);
  // the outline is closed: the outer face runs unbroken round all four corners
  const onFace = (x) => edges.filter(([a, b]) => a[0] === x && b[0] === x).reduce((n, [a, b]) => n + Math.abs(a[1] - b[1]), 0);
  assert.equal(onFace(0), 60);
  assert.equal(onFace(70), 60 - 20); // less the scoop's opening
  // inner edges stop at the cavity corners, they do not run on to the outer face
  for (const [a, b] of edges) {
    for (const p of [a, b]) {
      const onInnerY = p[1] === t || p[1] === 60 - t;
      if (onInnerY && a[1] === b[1]) assert.ok(p[0] >= t && p[0] <= 70 - t, `${a} ${b}`);
    }
  }
});

test('scoops are described', () => {
  assert.match(renderSchematic(TRAY(U)), /tray: box 70 by 60 by 30 mm at \(0, 0, 0\), hollow with 3 mm walls, with a U-shaped scoop 20 wide and 12 deep in the \+x wall/);
});

test('iso clips each scoop cut surface to its notch, and fills the rim as one shape', () => {
  const svg = renderSchematic(TRAY('[{ side: +x, at: 30, width: 20, depth: 12 }, { side: -x, at: 30, width: 20, depth: 12 }]'), { view: 'iso' });
  // the part of a cut behind the wall is hidden: one clipped group per scoop
  assert.equal((svg.match(/<g clip-path="url\(#[^)]+\)">/g) || []).length, 2);
  // the six rim pieces are subpaths of one backing path, so no seams show between them
  const backing = [...svg.matchAll(/<path d="([^"]+)" class="sb"/g)].map((m) => (m[1].match(/M/g) || []).length);
  assert.ok(backing.includes(6), `${backing}`);
});

test('hide keeps a shape in the model and the description, but does not draw it', () => {
  const src = (hide) => `shapes:\n  - { type: box, id: crate, at: [0, 0], size: [10, 20, 30] }\n  - { type: dim, from: [0, 0], to: [10, 0], offset: [0, -3]${hide} }\n  - { type: label, at: [5, 5], text: a note${hide} }\n`;
  const shown = renderSchematic(src(''));
  const hidden = renderSchematic(src(', hide: true'));
  assert.match(shown, />10 mm<\/text>/);
  assert.match(shown, />a note<\/text>/);
  assert.doesNotMatch(hidden, />10 mm<\/text>/);
  assert.doesNotMatch(hidden, />a note<\/text>/);
  // still recorded for the description
  assert.match(hidden, /<desc[^>]*>[^<]*Dimensions: 10 mm\.[^<]*Callouts: a note\./);
  assert.equal(parse(src(', hide: true')).shapes.filter((s) => s.hide).length, 2);
  assert.throws(() => parse('shapes:\n  - { type: box, at: [0, 0], size: [1, 1, 1], hide: maybe }'), /shapes\[0\]\.hide/);
  // the enclosure fixture records its tray scoop dimensions this way: in the
  // description (26 and 24 mm), not drawn
  const encl = renderSchematic(ENCL);
  assert.doesNotMatch(encl, />26 mm<\/text>/);
  assert.match(encl, /<desc[^>]*>[^<]*26 mm/);
});

const SLOT = (slots, extra = '') =>
  `views: [plan, front, side, section, iso]\nshapes:\n  - { type: box, id: crate, at: [0, 0, 0], size: [100, 80, 90], wall: 4, floor: 40, style: blue, ${extra}slots: ${slots} }\n`;
const DRAWER = '[{ side: +x, at: 40, width: 60, height: 30, depth: 70, bottom: 4 }]';

test('slots are parsed, with bottom defaulting to the base', () => {
  assert.deepEqual(parse(SLOT(DRAWER)).shapes[0].slots, [{ side: '+x', at: 40, width: 60, height: 30, depth: 70, bottom: 4 }]);
  assert.equal(parse(SLOT('[{ side: -y, at: 50, width: 20, height: 10, depth: 30 }]')).shapes[0].slots[0].bottom, 0);
  assert.deepEqual(parse(SLOT('[]')).shapes[0].slots, []);
});

test('slot validation names the field', () => {
  const bad = (slots, re) => assert.throws(() => parse(SLOT(slots)), re);
  bad('[{ side: up, at: 40, width: 60, height: 30, depth: 70 }]', /shapes\[0\]\.slots\[0\]\.side: unknown side/);
  bad('[{ side: +x, at: 40, width: 60, height: 30 }]', /slots\[0\]/);
  bad('[{ side: +x, at: 40, width: 60, height: 30, depth: 70, tall: 1 }]', /slots\[0\]\.tall: unknown field for a slot/);
  bad('[{ side: +x, at: 70, width: 60, height: 30, depth: 70 }]', /slot does not fit in the \+x face/);
  bad('[{ side: +x, at: 40, width: 60, height: 38, depth: 70, bottom: 4 }]', /slots\[0\]\.height: the slot must stay inside the floor/);
  bad('[{ side: +x, at: 40, width: 60, height: 30, depth: 120 }]', /slots\[0\]\.depth: 120 is deeper than the box \(100\)/);
  assert.throws(() => parse('shapes:\n  - { type: box, at: [0, 0, 0], size: [10, 10, 10], slots: [] }'), /shapes\[0\]\.slots: needs `wall`/);
});

test('a section through a slot leaves it empty, as a notch in from its side', () => {
  const outline = (slots) => firstOutline(renderSchematic(SLOT(slots), { view: 'section' }));
  assert.equal(outline('[]').length, 8);
  const cut = outline(DRAWER);
  assert.equal(cut.length, 12); // four more corners: in, across, back
  // the notch runs 70 of the 100 units in from the right, 30 of the 90 high
  const xs = [...new Set(cut.map((p) => p[0]))].sort((a, b) => a - b);
  const width = xs[xs.length - 1] - xs[0];
  assert.ok(xs.some((x) => Math.abs((xs[xs.length - 1] - x) / width - 0.7) < 0.01), `${xs}`);
  // a cut that misses the slot (it spans y 10 to 70) leaves the floor solid
  assert.equal(firstOutline(renderSchematic(`cut: 75\n${SLOT(DRAWER)}`, { view: 'section' })).length, 8);
});

test('a slot shows as an opening where the view faces it, hidden lines elsewhere', () => {
  const count = (view, re) => (renderSchematic(SLOT(DRAWER), { view }).match(re) || []).length;
  const without = (view, re) => (renderSchematic(SLOT('[]'), { view }).match(re) || []).length;
  const outlines = /<polygon class="ln"/g;
  const dashed = /stroke-dasharray="12 4 2 4"/g;
  // the side view looks at the +x face: one more outline, the opening
  assert.equal(count('side', outlines) - without('side', outlines), 1);
  assert.equal(count('side', dashed), without('side', dashed));
  // plan and front see it through the solid: one more hidden outline each
  for (const view of ['plan', 'front']) {
    assert.equal(count(view, outlines), without(view, outlines));
    assert.equal(count(view, dashed) - without(view, dashed), 1);
  }
});

test('iso draws a slot on a face toward the viewer, and not one turned away', () => {
  const outlines = (slots) => (renderSchematic(SLOT(slots), { view: 'iso' }).match(/<polygon class="ln"/g) || []).length;
  const none = outlines('[]');
  assert.equal(outlines(DRAWER) - none, 1 + 3); // the opening, and the back, far side and floor through it
  assert.equal(outlines('[{ side: +y, at: 50, width: 60, height: 30, depth: 50, bottom: 4 }]') - none, 1 + 3);
  assert.equal(outlines('[{ side: -x, at: 40, width: 60, height: 30, depth: 70, bottom: 4 }]'), none);
  assert.match(renderSchematic(SLOT(DRAWER)), /crate: box [^.]*slot 60 wide, 30 high and 70 deep in the \+x face/);
});

test('iso sees through the box to its slots: the tunnel edges behind a face are faint dash-dot', () => {
  const dashed = (slots) => (renderSchematic(SLOT(slots), { view: 'iso' }).match(/stroke-dasharray="12 4 2 4"/g) || []).length;
  const none = dashed('[]');
  // toward the viewer: the four edges running back and the four of the back rectangle
  assert.equal(dashed(DRAWER) - none, 8);
  // turned away: all of it is behind a face, the opening's four edges too
  assert.equal(dashed('[{ side: -x, at: 40, width: 60, height: 30, depth: 70, bottom: 4 }]') - none, 12);
  assert.match(renderSchematic(SLOT(DRAWER), { view: 'iso' }), /stroke-dasharray="12 4 2 4" stroke-opacity="0.55"/);
});

test('the enclosure fixture is one hollow body with its cubby as a slot in the floor', () => {
  const shapes = parse(ENCL).shapes;
  const body = shapes.find((s) => s.id === 'body');
  assert.deepEqual(parse(ENCL).views, ['plan', 'front', 'section', 'iso']);
  // one box from the base to the top: no seam between a tier and a compartment
  // (the tray is drawn twice: in plan and iso, and beside the box for the section)
  assert.deepEqual(shapes.filter((s) => s.type === 'box').map((s) => s.id), ['body', 'tray', 'tray-section']);
  assert.deepEqual([body.at[2], body.size[2]], [0, 90]);
  // the floor holds the slab under the cubby, the cubby and the compartment floor
  const [slot] = body.slots;
  near(body.floor, 5 + 30 + 5);
  assert.deepEqual(slot, { side: '+y', at: 60, width: 80, height: 30, depth: 70, bottom: 5 });
});

test('the enclosure fixture has a tray pulled out of the cubby opening, with scoops', () => {
  const m = parse(ENCL);
  const tray = m.shapes.find((s) => s.id === 'tray');
  const body = m.shapes.find((s) => s.id === 'body');
  // clear of the body, on the side the cubby opens on: the front, which is the
  // left face in iso, so the tray is drawn to the left
  assert.ok(tray.at[1] > body.at[1] + body.size[1]);
  assert.equal(body.slots[0].side, '+y');
  // lined up with the opening: both centred on the same line
  near(tray.at[0] + tray.size[0] / 2, body.slots[0].at);
  // a thumb scoop in the top of two walls of the box, and of the tray
  assert.deepEqual(body.scoops.map((sc) => [sc.side, sc.shape]), [['-y', 'round'], ['+y', 'round']]);
  assert.deepEqual(tray.scoops.map((sc) => sc.side), ['+y', '-y']);
});

test('the cubby depth dimension runs along the tunnel edge itself, not the box face', () => {
  const m = parse(ENCL);
  const body = m.shapes.find((s) => s.id === 'body');
  const [slot] = body.slots;
  const front = body.size[1]; // the face it opens on
  const right = slot.at + slot.width / 2; // the tunnel's right-hand wall
  // the cubby depth: as long as the slot in y, along the tunnel's bottom right edge
  const depthDims = m.shapes.filter((s) => s.type === 'dim' && Math.abs(s.to[1] - s.from[1]) === slot.depth && s.from[2] === slot.bottom && s.from[0] === right);
  assert.deepEqual(depthDims.map((d) => d.views), [['plan', 'iso']]);
  const [d] = depthDims;
  // both ends are the tunnel's corners: its mouth and its back, along its bottom edge
  assert.deepEqual([d.from[0], d.to[0]], [right, right]);
  assert.deepEqual([d.from[1], d.to[1]], [front - slot.depth, front]);
  assert.deepEqual([d.from[2], d.to[2]], [slot.bottom, slot.bottom]);
});

test('the enclosure drawing has no callout text, only dimensions; the callouts stay in the description', () => {
  const m = parse(ENCL);
  const labels = m.shapes.filter((s) => s.type === 'label');
  assert.ok(labels.length > 0 && labels.every((l) => l.hide));
  assert.equal(m.shapes.filter((s) => s.label).length, 0); // no box captions either
  for (const view of ['plan', 'front', 'section', 'iso']) {
    const svg = renderSchematic(ENCL, { view });
    const texts = [...svg.matchAll(/<text [^>]*>([^<]*)<\/text>/g)].map((t) => t[1]).filter((t) => !/^(PLAN|FRONT|SECTION|ISO)$/.test(t));
    assert.ok(texts.length > 0 && texts.every((t) => /^[\d.]+ mm$/.test(t)), `${view}: ${texts}`);
  }
  assert.match(renderSchematic(ENCL), /Callouts: [^<]*cubby/);
});

test('the enclosure fixture dimensions its outer size, the tray, the scoops and the cubby', () => {
  const m = parse(ENCL);
  const dims = m.shapes.filter((s) => s.type === 'dim').map((s) => Math.round(Math.hypot(...s.to.map((v, i) => v - s.from[i]))));
  // box 120 x 100 x 90, tray 76 x 64 x 28 outside and 68 x 56 inside, its scoops
  // 26 in and 24 wide, cubby 80 x 30 x 70 with 20 of floor on each side
  assert.deepEqual([...new Set(dims)].sort((a, b) => a - b), [20, 24, 26, 28, 30, 56, 64, 68, 70, 76, 80, 90, 100, 120]);
  assert.equal(m.shapes.filter((s) => s.type === 'dim').length, 21);
});

test('the enclosure renders in every view: sizes, polygons and dimension texts', () => {
  const view = (v) => [...renderSchematic(ENCL, { view: v }).matchAll(/data-view="(\w+)"/g)].map((m) => m[1]);
  assert.deepEqual(view(), ['plan', 'front', 'section', 'iso']);
  assert.deepEqual(view('iso'), ['iso']);
  assert.deepEqual(view('plan, side'), ['plan', 'side']);
  const polys = (v) => (renderSchematic(ENCL, { view: v }).match(/<polygon class="ln"/g) || []).length;
  // plan: the lowered wall under each scoop (2 for the body, 2 for the tray)
  assert.equal(polys('plan'), 2 + 2);
  // iso: the body and the tray (3 inside faces, 2 outer faces, a cut band per
  // scoop), and the cubby: its opening and the three faces seen through it
  assert.equal(polys('iso'), 2 * (3 + 2 + 2) + (1 + 3));
  const text = (v) => [...renderSchematic(ENCL, { view: v }).matchAll(/>([\d.]+ mm)<\/text>/g)].map((m) => m[1]);
  assert.deepEqual(text('plan'), ['120 mm', '100 mm', '76 mm', '64 mm', '68 mm', '56 mm', '20 mm', '80 mm', '20 mm', '70 mm']);
  assert.deepEqual(text('front'), ['120 mm', '90 mm', '80 mm', '30 mm']);
  assert.deepEqual(text('section'), ['28 mm', '80 mm', '30 mm']);
  assert.deepEqual(text('iso'), ['76 mm', '64 mm', '28 mm', '70 mm', '30 mm', '80 mm']);
});

test('a schematic fence takes its source from the block, or from a file beside the post', () => {
  const { schematicSource } = require('../src/schematic/source');
  const post = path.join(__dirname, 'fixtures', 'post.md');
  assert.equal(schematicSource('views: [plan]', 'alt="x"', post), 'views: [plan]');
  assert.equal(schematicSource('', 'alt="x" src="enclosure.schematic.yaml" view="iso"', post), ENCL);
  assert.equal(schematicSource('  \n', 'src="enclosure.schematic.yaml"', post), ENCL);
  // the file renders like the same source given inline
  assert.equal(renderSchematic(schematicSource('', 'src="enclosure.schematic.yaml"', post)), renderSchematic(ENCL));
  assert.throws(() => schematicSource('shapes: []', 'src="enclosure.schematic.yaml"', post), /in the block or in src, not both/);
  assert.throws(() => schematicSource('', 'src="nope.yaml"', post), /src "nope\.yaml" does not exist/);
  assert.throws(() => schematicSource('', 'src="../images.test.js"', post), /must be inside/);
  assert.throws(() => schematicSource('', `src="${__filename}"`, post), /must be inside/);
});
