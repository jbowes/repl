// A real production build, into a temp directory, checked for what the pages
// must look like. The build is made once and shared by the tests.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { default: register } = require('@babel/register');

register({ only: [/\/src\//, /\/webpack\/config\.js$/] });

const webpack = require('webpack');
const sharp = require('sharp');
const config = require('../webpack/config').default;

let built;
function build() {
  built = built || (async () => {
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'repl-build-'));
    const compiler = webpack({ ...config, output: { ...config.output, path: out } });
    const stats = await new Promise((resolve, reject) => compiler.run((err, s) => (err ? reject(err) : resolve(s))));
    await new Promise((resolve) => compiler.close(resolve));
    assert.ok(!stats.hasErrors(), stats.toString({ all: false, errors: true }));
    return out;
  })();
  return built;
}

test.after(async () => {
  if (built) fs.rmSync(await built, { recursive: true, force: true });
});

test('built pages keep the quotes on attribute values', async () => {
  const out = await build();
  const html = fs.readFileSync(path.join(out, 'fresh-start', 'index.html'), 'utf8');
  // WhatsApp ignores an og:image whose attributes are unquoted
  assert.match(html, /<meta property="og:image" content="https:\/\/repl\.ca\/[^"]+">/);
  assert.match(html, /<html lang="en">/);
  // and the rest is still minified
  assert.match(html, /^<!doctype html><html/);
});

test('a photo in a post is built with smaller copies and a srcset', async () => {
  const out = await build();
  const html = fs.readFileSync(path.join(out, 'gamegenic-sidekick-pro-xl-tray-dimensions', 'index.html'), 'utf8');
  const img = /<img [^>]*class="post-image"[^>]*>/.exec(html)[0];
  // the HTML minifier drops the space after each comma in a list attribute
  const srcset = /srcset="([^"]+)"/.exec(img)[1].split(',').map((c) => c.split(' '));
  const widths = srcset.map(([, w]) => Number(w.replace('w', '')));
  assert.deepEqual(widths, [480, 800, 1200, 1400]);
  // the spaces inside calc() must survive: it needs them around the minus
  assert.match(img, /sizes="\(min-width: 30em\) calc\(66\.667vw - 2rem\),90vw"/);
  assert.match(img, /width="1400" height="695"/);
  // every file in the srcset was emitted, at the width it claims, with no metadata
  for (const [url, w] of srcset) {
    const meta = await sharp(path.join(out, url)).metadata();
    assert.equal(meta.width, Number(w.replace('w', '')), url);
    assert.equal(meta.exif, undefined, url);
  }
  // the src is the full-size file, and is one of the srcset entries
  assert.ok(srcset.some(([url]) => img.includes(`src="${url}"`)));
});
