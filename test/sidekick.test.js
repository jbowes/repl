// The Sidekick Pro XL drawing (content/schematics/sidekick-pro-xl.schematic.yaml) and
// the numbers in it: the owner's measurements, and what is assumed or guessed.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { parse } = require('../src/schematic/schema');
const { renderSchematic } = require('../src/schematic/render');

// the drawing the post shows, kept beside it in content/
const DECK = fs.readFileSync(path.join(__dirname, '..', 'content', 'schematics', 'sidekick-pro-xl.schematic.yaml'), 'utf8');
const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);

test('the deck box fixture dimensions only the box outer sizes and the measured tray, scoops and cubby', () => {
  const m = parse(DECK);
  const dims = m.shapes.filter((s) => s.type === 'dim').map((s) => Math.round(Math.hypot(...s.to.map((v, i) => v - s.from[i]))));
  // box base 94.5 x 113 and height 102, tray 80 x 85.7 x 33.7 outside and
  // 69.4 x 75.1 x 28.4 inside, its scoops 29.5 in, 26.7 wide, 14.7 deep over 19,
  // cubby 88.5 x 36 x 80 with 12.25 of base on each side
  assert.deepEqual([...new Set(dims)].sort((a, b) => a - b), [12, 15, 19, 27, 28, 30, 34, 36, 69, 75, 80, 86, 89, 95, 102, 113]);
  // and nothing else: every dimension is one of those measurements
  assert.equal(m.shapes.filter((s) => s.type === 'dim').length, 4 + 4 + 3 + 4 + 8 + 1 + 3 + 3);
});

const HOLLOW = 'views: [plan, section, iso]\nshapes:\n  - { type: box, at: [0, 0, 0], size: [100, 80, 60], wall: 4, floor: 20, style: blue }\n';

test('the deck box is one hollow body with the tray cubby as a slot in its floor', () => {
  const shapes = parse(DECK).shapes;
  const body = shapes.find((s) => s.id === 'body');
  assert.deepEqual(parse(DECK).views, ['plan', 'front', 'section', 'iso']);
  // one box from the base to the top: no seam between a tier and a compartment
  // (the tray is drawn twice: in plan and iso, and beside the box for the section)
  assert.deepEqual(shapes.filter((s) => s.type === 'box').map((s) => s.id), ['body', 'tray', 'tray-section']);
  assert.deepEqual([body.at[2], body.size[2]], [0, 102]);
  // the floor holds the slab under the cubby, the cubby and the compartment floor
  const [slot] = body.slots;
  near(body.floor, 5.3 + 36 + 5.3);
  assert.deepEqual(slot, { side: '+y', at: 56.5, width: 88.5, height: 36, depth: 80, bottom: 5.3 });
  // 113 mm along x and 94.5 deep, the opening in the 113 mm front face
  assert.deepEqual(body.size.slice(0, 2), [113, 94.5]);
});

const TRAY = (scoops, extra = '') =>
  `views: [plan, front, side, section, iso]\nshapes:\n  - { type: box, id: tray, at: [0, 0, 0], size: [70, 60, 30], wall: 3, style: yellow, ${extra}scoops: ${scoops} }\n`;
const U = '[{ side: +x, at: 30, width: 20, depth: 12 }]';
// the first full-strength outline (lowered wall parts are fainter)
const firstOutline = (svg) => /<polygon class="ln" points="([^"]+)" stroke="currentColor" stroke-width="1.5"\/>/.exec(svg)[1].split(' ').map((p) => p.split(',').map(Number));

test('the cubby depth dimension runs along the tunnel edge itself, not the box face', () => {
  const m = parse(DECK);
  const [slot] = m.shapes.find((s) => s.id === 'body').slots;
  const front = m.shapes.find((s) => s.id === 'body').size[1]; // the face it opens on, y = 94.5
  const right = slot.at + slot.width / 2; // the tunnel's right-hand wall, 100.75
  // the dimensions of the cubby depth: 80 long in y, along the tunnel's bottom right edge
  // (not the tray's own 80 mm depth, which is elsewhere)
  const depthDims = m.shapes.filter((s) => s.type === 'dim' && Math.abs(s.to[1] - s.from[1]) === slot.depth && s.from[2] === slot.bottom && s.from[0] < 113);
  assert.deepEqual(depthDims.map((d) => d.views).sort(), [['iso'], ['plan']]);
  for (const d of depthDims) {
    // both ends are the tunnel's corners: its mouth and its back, along its bottom edge
    assert.deepEqual([d.from[0], d.to[0]], [right, right]);
    assert.deepEqual([d.from[1], d.to[1]], [front - slot.depth, front]);
    assert.deepEqual([d.from[2], d.to[2]], [slot.bottom, slot.bottom]);
  }
});

test('the sample has a tray pulled out of the cubby opening, with scoops', () => {
  const m = parse(DECK);
  const tray = m.shapes.find((s) => s.id === 'tray');
  const body = m.shapes.find((s) => s.id === 'body');
  // clear of the body, on the side the cubby opens on: the front, which is the
  // left face in iso, so the tray is drawn to the left
  assert.ok(tray.at[1] > body.at[1] + body.size[1]);
  assert.equal(body.slots[0].side, '+y');
  // lined up with the opening: both centred on the same line
  near(tray.at[0] + tray.size[0] / 2, body.slots[0].at);
  // a thumb scoop in the top of both side walls of the box, and of the tray
  assert.deepEqual(body.scoops.map((sc) => [sc.side, sc.shape]), [['-y', 'round'], ['+y', 'round']]);
  assert.deepEqual(tray.scoops.map((sc) => sc.side), ['+y', '-y']);
});

test('the deck box drawing has no callout text, only dimensions; the callouts stay in the description', () => {
  const m = parse(DECK);
  const labels = m.shapes.filter((s) => s.type === 'label');
  assert.ok(labels.length > 0 && labels.every((l) => l.hide));
  assert.equal(m.shapes.filter((s) => s.label).length, 0); // no box captions either
  for (const view of ['plan', 'front', 'section', 'iso']) {
    const svg = renderSchematic(DECK, { view });
    const texts = [...svg.matchAll(/<text [^>]*>([^<]*)<\/text>/g)].map((t) => t[1]).filter((t) => !/^(PLAN|FRONT|SECTION|ISO)$/.test(t));
    assert.ok(texts.length > 0 && texts.every((t) => /^[\d.]+ mm$/.test(t)), `${view}: ${texts}`);
  }
  assert.match(renderSchematic(DECK), /Callouts: [^<]*tray cubby/);
});
test('a source renders as plan, front or iso, and views can be overridden', () => {
  const view = (v) => [...renderSchematic(DECK, { view: v }).matchAll(/data-view="(\w+)"/g)].map((m) => m[1]);
  assert.deepEqual(view(), ['plan', 'front', 'section', 'iso']);
  assert.deepEqual(view('iso'), ['iso']);
  assert.deepEqual(view('plan, side'), ['plan', 'side']);

  // plan has the hollow body and the tray (their rims are stroked as edges,
  // not polygons, so only the lowered wall under each scoop counts: 2 each).
  // iso has the body and the tray (3 inside faces, 2 outer faces, a cut band
  // per scoop), and the cubby: its opening and the three faces seen through it.
  const polys = (v) => (renderSchematic(DECK, { view: v }).match(/<polygon class="ln"/g) || []).length;
  assert.equal(polys('plan'), 2 + 2);
  assert.equal(polys('iso'), 2 * (3 + 2 + 2) + (1 + 3));
});

test('dimensions follow the view: shown where they have length, text is the true length', () => {
  const text = (v) => [...renderSchematic(DECK, { view: v }).matchAll(/>([\d.]+ mm)<\/text>/g)].map((m) => m[1]);
  assert.deepEqual(text('plan'), ['113 mm', '94.5 mm', '85.7 mm', '80 mm', '75.1 mm', '69.4 mm', '12.25 mm', '88.5 mm', '12.25 mm', '80 mm']);
  assert.deepEqual(text('section'), ['33.7 mm', '28.4 mm', '88.5 mm', '36 mm']);
  assert.deepEqual(text('front'), ['113 mm', '102 mm', '88.5 mm', '36 mm']);
  // the height is dimensioned in the front elevation only
  // iso leaves the box's own outer size to the plan and front, and carries the
  // tray's outer and inner width, depth and height and the cubby's width,
  // height and depth
  assert.deepEqual(text('iso'), ['85.7 mm', '33.7 mm', '80 mm', '75.1 mm', '69.4 mm', '28.4 mm', '88.5 mm', '36 mm', '80 mm']);
});


test('the scoop measurements are recorded in the description but not drawn', () => {
  const deck = renderSchematic(DECK);
  assert.doesNotMatch(deck, />(29\.5|26\.7|14\.7|19) mm<\/text>/);
  assert.match(deck, /<desc[^>]*>[^<]*29\.5 mm/);
});
