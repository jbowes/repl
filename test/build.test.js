// A real production build, into a temp directory, checked for what the pages
// must look like to link-preview parsers.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { default: register } = require('@babel/register');

register({ only: [/\/src\//, /\/webpack\/config\.js$/] });

const webpack = require('webpack');
const config = require('../webpack/config').default;

test('built pages keep the quotes on attribute values', async () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'repl-build-'));
  try {
    const compiler = webpack({ ...config, output: { ...config.output, path: out } });
    const stats = await new Promise((resolve, reject) => compiler.run((err, s) => (err ? reject(err) : resolve(s))));
    await new Promise((resolve) => compiler.close(resolve));
    assert.ok(!stats.hasErrors(), stats.toString({ all: false, errors: true }));

    const html = fs.readFileSync(path.join(out, 'fresh-start', 'index.html'), 'utf8');
    // WhatsApp ignores an og:image whose attributes are unquoted
    assert.match(html, /<meta property="og:image" content="https:\/\/repl\.ca\/[^"]+">/);
    assert.match(html, /<html lang="en">/);
    // and the rest is still minified
    assert.match(html, /^<!doctype html><html/);
  } finally {
    fs.rmSync(out, { recursive: true, force: true });
  }
});
