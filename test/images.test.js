// Run with `npm test`. Uses the fixtures next to this file: small.png and
// small.svg are under INLINE_LIMIT, large.png is over it.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { default: register } = require('@babel/register');

register({ only: [/\/src\//] });

const { INLINE_LIMIT, SIZES, processImage, emittedImages } = require('../src/images');

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

// Responsive copies of the images emitted as files.
const sharp = require('sharp');
const fs = require('fs');
const os = require('os');

async function tempImage(name, width, height, format = 'webp') {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'repl-img-'));
  // noise, so it is well over INLINE_LIMIT at any size
  const raw = Buffer.alloc(width * height * 3);
  for (let i = 0; i < raw.length; i++) raw[i] = (i * 2654435761) >>> 24;
  await sharp(raw, { raw: { width, height, channels: 3 } }).toFormat(format).toFile(path.join(dir, name));
  return path.join(dir, 'post.md');
}

test('a wide image gets a srcset of the smaller widths and the original', async () => {
  const from = await tempImage('wide.webp', 1400, 300);
  const img = processImage('wide.webp', 'a wide one', from);
  const [, stem] = /^\/images\/(wide-[0-9a-f]{8})\.webp$/.exec(img.src);
  assert.equal(img.srcSet, [480, 720, 1080].map((w) => `/images/${stem}-${w}w.webp ${w}w`).concat(`${img.src} 1400w`).join(', '));
  assert.equal(img.sizes, SIZES);
  // width and height stay those of the original, so the layout does not shift
  assert.deepEqual([img.width, img.height], [1400, 300]);
  // each copy is queued to be made, from the same file, at its width
  for (const w of [480, 720, 1080]) {
    const queued = emittedImages().get(`images/${stem}-${w}w.webp`);
    assert.equal(queued.width, w);
    assert.equal(queued.file, path.join(path.dirname(from), 'wide.webp'));
  }
  assert.equal(emittedImages().get(`images/${stem}.webp`).width, undefined); // the original is copied as it is
});

test('only the widths narrower than the image are used', async () => {
  const from = await tempImage('mid.webp', 900, 200);
  const img = processImage('mid.webp', 'a mid one', from);
  assert.deepEqual([...img.srcSet.matchAll(/ (\d+)w/g)].map((m) => Number(m[1])), [480, 720, 900]);
  // an image no wider than the smallest width has nothing smaller to offer
  const narrow = processImage('narrow.webp', 'x', await tempImage('narrow.webp', 480, 480));
  assert.equal(narrow.srcSet, undefined);
  assert.equal(narrow.sizes, undefined);
});

test('PNG and JPEG are resized too, in their own format; GIF and SVG are not', async () => {
  const png = processImage('p.png', 'a png', await tempImage('p.png', 1000, 100, 'png'));
  assert.match(png.srcSet, /-480w\.png 480w, .*-720w\.png 720w, \/images\/p-[0-9a-f]{8}\.png 1000w$/);
  const jpg = processImage('j.jpg', 'a jpg', await tempImage('j.jpg', 1000, 100, 'jpeg'));
  assert.match(jpg.srcSet, /-480w\.jpg 480w/);
  assert.equal(processImage('large.png', 'x', post).srcSet, undefined); // 48 wide: nothing smaller
  // an SVG scales on its own, and a GIF may be animated, which a resize would flatten
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'repl-img-'));
  fs.writeFileSync(path.join(dir, 'big.svg'), `<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="100" viewBox="0 0 2000 100">${'<rect width="1" height="1"/>'.repeat(200)}</svg>`);
  const svg = processImage('big.svg', 'an svg', path.join(dir, 'post.md'));
  assert.equal(svg.srcSet, undefined);
});

test('a social image is one fixed file, with no srcset', async () => {
  const from = await tempImage('social.webp', 1400, 300);
  const img = processImage('social.webp', 'social', from, { file: true });
  assert.equal(img.srcSet, undefined);
  assert.equal([...emittedImages().keys()].filter((k) => k.includes('/social-')).length, 1);
});

test('the same image always gets the same names', async () => {
  const from = await tempImage('same.webp', 1400, 300);
  assert.deepEqual(processImage('same.webp', 'a', from), processImage('same.webp', 'a', from));
});

test('SIZES describes the post column in style.css', () => {
  const css = fs.readFileSync(path.join(__dirname, '..', 'src', 'css', 'style.css'), 'utf8');
  // the narrow column: main's width outside any media query
  const base = /(?:^|\n)main \{[^}]*?width: ([\d.]+)%;/.exec(css);
  // the wide column: main's width, and its padding, in a min-width query
  const wide = /@media screen and \(min-width: ([\d.]+em)\) \{\s*main \{\s*width: ([\d.]+)%;\s*padding-left: ([\d.]+)rem;\s*padding-right: ([\d.]+)rem;/.exec(css);
  assert.ok(base && wide, 'found both column rules');
  const [, at, pct, left, right] = wide;
  const expected = `(min-width: ${at}) calc(${Number(pct).toFixed(3)}vw - ${Number(left) + Number(right)}rem), ${Number(base[1])}vw`;
  assert.equal(SIZES, expected);
});
