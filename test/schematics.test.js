// Schematic source, projection and rendering (src/schematic).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { parse } = require('../src/schematic/schema');
const { project, paintOrder, isoCircle } = require('../src/schematic/project');
const { renderSchematic } = require('../src/schematic/render');

const fixture = (name) => fs.readFileSync(path.join(__dirname, 'fixtures', name), 'utf8');
const DECK = fixture('sidekick-pro-xl.schematic.yaml');
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
  assert.throws(() => renderSchematic(DECK, { view: 'top' }), /view: expected a list of plan, front, side, section, iso/);
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

test('a source renders as plan, front or iso, and views can be overridden', () => {
  const view = (v) => [...renderSchematic(DECK, { view: v }).matchAll(/data-view="(\w+)"/g)].map((m) => m[1]);
  assert.deepEqual(view(), ['plan', 'front', 'section', 'iso']);
  assert.deepEqual(view('iso'), ['iso']);
  assert.deepEqual(view('plan, side'), ['plan', 'side']);

  // plan has the hollow body and the tray (their rims are stroked as edges,
  // not polygons, so only the lowered wall under each scoop counts: 1 and 2) and the card case; the lid is off. iso has the body and
  // the tray (3 inside faces, 2 outer faces, a cut band per scoop),
  // the card case and the lifted lid (three faces each). The drawer tier under
  // the body is a plain block from outside: one rectangle, or three faces.
  const polys = (v) => (renderSchematic(DECK, { view: v }).match(/<polygon class="ln"/g) || []).length;
  assert.equal(polys('plan'), 1 + 2 + 1 + 1);
  assert.equal(polys('iso'), (3 + 2 + 1) + (3 + 2 + 2) + 3 + 3 + 3);
});

test('dimensions follow the view: shown where they have length, text is the true length', () => {
  const text = (v) => [...renderSchematic(DECK, { view: v }).matchAll(/>([\d.]+ mm)<\/text>/g)].map((m) => m[1]);
  assert.deepEqual(text('plan'), ['110 mm', '104 mm', '80 mm', '85.7 mm', '88.5 mm']);
  assert.deepEqual(text('section'), ['33.7 mm', '80 mm', '36 mm']);
  assert.deepEqual(text('front'), ['110 mm', '102 mm']);
  // the lid is lifted in iso, so there is no closed height to dimension there
  assert.deepEqual(text('iso'), ['110 mm', '104 mm', '80 mm', '33.7 mm']);
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
  assert.equal(renderSchematic(DECK), renderSchematic(DECK));
  assert.notEqual(renderSchematic(DECK, { view: 'iso' }), renderSchematic(DECK, { view: 'plan' }));
  const svg = renderSchematic(DECK, { alt: 'Deck box' });
  assert.match(svg, /<text [^>]*>110 mm<\/text>/);
  assert.match(svg, /approx\./);
});

test('standalone output embeds the palette CSS', () => {
  const svg = renderSchematic(DECK, { standalone: true });
  assert.match(svg, /<style>.*\.dg-blue\{--dg:#92b0c2\}/);
  assert.match(svg, /\.dg-node \.sf\{/);
});

test('the deck box fixture dimensions only the box outer sizes and the measured tray and cubby', () => {
  const m = parse(DECK);
  const dims = m.shapes.filter((s) => s.type === 'dim').map((s) => Math.round(Math.hypot(...s.to.map((v, i) => v - s.from[i]))));
  // box 110 x 104 x 102, tray 80 x 85.7 x 33.7, cubby 88.5 x 36 x 80
  assert.deepEqual([...new Set(dims)].sort((a, b) => a - b), [34, 36, 80, 86, 89, 102, 104, 110]);
  // and nothing else: every dimension is one of those measurements
  assert.equal(m.shapes.filter((s) => s.type === 'dim').length, 4 + 4 + 3);
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

test('the deck box models a hollow body, not stacked slabs', () => {
  const shapes = parse(DECK).shapes;
  const body = shapes.find((s) => s.id === 'body');
  assert.ok(body.wall > 0);
  assert.deepEqual(parse(DECK).views, ['plan', 'front', 'section', 'iso']);
  // the section leaves the tray cubby empty: 80 deep and 36 high, above the
  // base slab and beside the side block
  const base = shapes.find((s) => s.id === 'tier-base');
  const side = shapes.find((s) => s.id === 'tier-side');
  assert.deepEqual([base.views, side.views], [['section'], ['section']]);
  assert.equal(side.at[0], 80);
  assert.equal(side.size[2], 36);
  assert.equal(side.at[2], base.size[2]);
  assert.equal(body.at[2], base.size[2] + side.size[2]);
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
  // each, and an end at each side of the scoop.
  assert.equal(edges.length, 3 * 2 + (2 * 2 + 2));
  const across = edges.filter(([a, b]) => a[0] !== b[0] && a[1] !== b[1]);
  assert.equal(across.length, 0); // nothing diagonal
  // the edges that cross the wall's thickness are the scoop's two ends, at y 20 and 40
  const crossing = edges.filter(([a, b]) => Math.abs(a[0] - b[0]) === t && a[1] === b[1]);
  assert.deepEqual(crossing.map(([a]) => a[1]).sort((x, y) => x - y), [20, 40]);
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

test('the deck box fixture has a tray pulled out to the left, with scoops', () => {
  const m = parse(DECK);
  const tray = m.shapes.find((s) => s.id === 'tray');
  const body = m.shapes.find((s) => s.id === 'body');
  assert.ok(tray.at[0] + tray.size[0] < body.at[0]); // clear of the body, to its left
  assert.equal(tray.scoops[0].side, '+x'); // the wall facing the box
  assert.equal(body.scoops[0].side, '-x');
  assert.equal(body.scoops[0].shape, 'round');
});
