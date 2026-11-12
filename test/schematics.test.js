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
  assert.throws(() => renderSchematic(DECK, { view: 'top' }), /view: expected a list of plan, front, side, iso/);
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
  assert.deepEqual(view(), ['plan', 'front', 'iso']);
  assert.deepEqual(view('iso'), ['iso']);
  assert.deepEqual(view('plan, side'), ['plan', 'side']);

  // iso draws three faces per box, plan one rectangle
  const polys = (v) => (renderSchematic(DECK, { view: v }).match(/<polygon class="ln"/g) || []).length;
  assert.equal(polys('iso'), 4 * 3);
  assert.equal(polys('plan'), 4);
});

test('dimensions follow the view: shown where they have length, text is the true length', () => {
  const text = (v) => [...renderSchematic(DECK, { view: v }).matchAll(/>(\d+ mm)<\/text>/g)].map((m) => m[1]);
  assert.deepEqual(text('plan'), ['110 mm', '104 mm']);
  assert.deepEqual(text('front'), ['110 mm', '102 mm']);
  assert.deepEqual(text('iso'), ['110 mm', '104 mm', '102 mm']);
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
  bad('shapes:\n  - { type: label, at: [0, 0], text: x, views: [top] }', /shapes\[0\]\.views: expected a list of plan, front, side, iso/);
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

test('the deck box fixture carries only the three outer dimensions', () => {
  const m = parse(DECK);
  const dims = m.shapes.filter((s) => s.type === 'dim').map((s) => Math.round(Math.hypot(...s.to.map((v, i) => v - s.from[i]))));
  assert.deepEqual([...new Set(dims)].sort((a, b) => a - b), [102, 104, 110]);
});
