// Diagram colour and fill syntax (src/diagram).
const test = require('node:test');
const assert = require('node:assert/strict');

const { parse } = require('../src/diagram/parse');
const { renderDiagram } = require('../src/diagram/render');

test('flowchart nodes take a colour and fill style', () => {
  const m = parse('flowchart LR\n  A[a]:::blue --> B(b):::green-solid\n  B --> C{c}:::red-cross');
  const style = Object.fromEntries(m.nodes.map((n) => [n.id, n.style]));
  assert.deepEqual(style.A, { color: 'blue', fill: 'hachure' });
  assert.deepEqual(style.B, { color: 'green', fill: 'solid' });
  assert.deepEqual(style.C, { color: 'red', fill: 'cross-hatch' });
  assert.equal(m.nodes.find((n) => n.id === 'A').label, 'a');
});

test('participants take a colour, with or without a label', () => {
  const m = parse('sequenceDiagram\n  participant P as Provider:::green\n  participant R:::orange\n  P->>R: hi');
  assert.deepEqual(m.participants.map((p) => [p.id, p.label, p.style.color]), [
    ['P', 'Provider', 'green'],
    ['R', 'R', 'orange'],
  ]);
});

test('unknown colours and fills are errors', () => {
  assert.throws(() => parse('flowchart LR\n  A[a]:::purple'), /unknown style/);
  assert.throws(() => parse('flowchart LR\n  A[a]:::blue-dotted'), /unknown style/);
});

test('coloured nodes get theme classes and fill paths', () => {
  const svg = renderDiagram('flowchart LR\n  A[a]:::blue-solid --> B[b]\n');
  assert.match(svg, /<g class="dg-node dg-blue">/);
  assert.match(svg, /class="fs"/);
  assert.match(svg, /<g class="dg-node">/);
  assert.match(svg, /<g class="dg-edge">/);
});

test('rendering is deterministic', () => {
  const src = 'flowchart TB\n  A[a]:::red --> B[b]:::yellow-cross';
  assert.equal(renderDiagram(src), renderDiagram(src));
});
