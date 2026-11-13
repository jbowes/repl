// Run with `npm test`. Uses the fixtures next to this file: small.png and
// small.svg are under INLINE_LIMIT, large.png is over it.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { default: register } = require('@babel/register');

register({ only: [/\/src\//] });

const { INLINE_LIMIT, processImage, emittedImages } = require('../src/images');

const post = path.join(__dirname, 'fixtures', 'post.md');

test('small raster images are inlined as base64 with their size', () => {
  const img = processImage('small.png', 'a gradient', post);
  assert.match(img.src, /^data:image\/png;base64,/);
  assert.deepEqual([img.width, img.height], [16, 8]);
  assert.equal(img.loading, undefined);
});

test('small SVGs are inlined URL-encoded, sized from the viewBox', () => {
  const img = processImage('small.svg', 'a red box', post);
  assert.match(img.src, /^data:image\/svg\+xml,%3Csvg/);
  assert.ok(!img.src.includes('base64'));
  assert.deepEqual([img.width, img.height], [40, 20]);
});

test('large images are emitted as hashed files and lazy loaded', () => {
  const img = processImage('large.png', 'noise', post);
  assert.ok(require('fs').statSync(path.join(__dirname, 'fixtures', 'large.png')).size > INLINE_LIMIT);
  assert.match(img.src, /^\/images\/large-[0-9a-f]{8}\.png$/);
  assert.equal(img.loading, 'lazy');
  assert.equal(img.decoding, 'async');
  assert.deepEqual([img.width, img.height], [48, 48]);
  assert.ok(emittedImages().has(img.src.slice(1)));
});

test('output is deterministic', () => {
  assert.deepEqual(processImage('large.png', 'noise', post), processImage('large.png', 'noise', post));
});

test('missing alt text or files fail the build', () => {
  assert.throws(() => processImage('small.png', '', post), /needs alt text/);
  assert.throws(() => processImage('nope.png', 'x', post), /does not exist/);
});

test('file: true always emits a file, even for an image small enough to inline', () => {
  const small = processImage('small.png', 'a gradient', post, { file: true });
  assert.match(small.src, /^\/images\/small-[0-9a-f]{8}\.png$/);
  assert.ok(emittedImages().has(small.src.slice(1)));
  assert.match(processImage('small.png', 'a gradient', post).src, /^data:/); // the default is unchanged
});
