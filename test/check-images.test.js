// The commit-time image checker (scripts/check-images.js).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const sharp = require('sharp');

const { problems } = require('../scripts/check-images');

const root = path.join(__dirname, '..');
const geotagged = path.join(__dirname, 'fixtures', 'geotagged.jpg');

// problems() takes repo-relative paths, so stage test files under a scratch
// directory inside the repo and clean up afterwards.
function scratch(name, data) {
  const dir = fs.mkdtempSync(path.join(root, 'test', 'tmp-'));
  fs.writeFileSync(path.join(dir, name), data);
  return { rel: path.relative(root, path.join(dir, name)), done: () => fs.rmSync(dir, { recursive: true }) };
}

test('PNG and JPEG are rejected: images must be WebP', async () => {
  const f = scratch('a.jpg', fs.readFileSync(geotagged));
  try {
    assert.match((await problems(f.rel))[0], /must be WebP/);
  } finally { f.done(); }
});

test('WebP carrying EXIF geotags is rejected', async () => {
  // Guard: the fixture really has EXIF, and withExif carries it into the WebP.
  assert.ok((await sharp(geotagged).metadata()).exif);
  const tagged = await sharp(geotagged).withExif({ IFD3: { GPSLatitudeRef: 'N', GPSLatitude: '44/1 38/1 0/1' } }).webp().toBuffer();
  assert.ok((await sharp(tagged).metadata()).exif, 'test WebP should have EXIF');

  const f = scratch('a.webp', tagged);
  try {
    assert.match((await problems(f.rel))[0], /embedded metadata \(exif\)/);
  } finally { f.done(); }
});

test('a clean WebP, an SVG and a GIF pass', async () => {
  const clean = await sharp(geotagged).webp().toBuffer();
  assert.equal((await sharp(clean).metadata()).exif, undefined);
  const f = scratch('a.webp', clean);
  try {
    assert.deepEqual(await problems(f.rel), []);
  } finally { f.done(); }
  assert.deepEqual(await problems('test/fixtures/small.svg'), []);
});

test('GIF is rejected, and --fix converts it to an animated WebP', async () => {
  const frames = Buffer.concat([0, 255].map((v) => Buffer.alloc(8 * 8 * 3, v)));
  const gif = await sharp(frames, { raw: { width: 8, height: 8 * 2, channels: 3, pageHeight: 8 } })
    .gif()
    .toBuffer();
  assert.equal((await sharp(gif, { animated: true }).metadata()).pages, 2);

  const f = scratch('a.gif', gif);
  try {
    assert.match((await problems(f.rel))[0], /must be WebP, not \.gif/);
    const { toWebp } = require('../scripts/check-images');
    const out = await toWebp(f.rel);
    assert.equal((await sharp(path.join(root, out), { animated: true }).metadata()).pages, 2);
    assert.deepEqual(await problems(out), []);
  } finally { f.done(); }
});
