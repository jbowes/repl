// Inlines a per-page stylesheet into every built page so first paint does
// not wait on a second request. Runs after `npm run css`, which writes the
// UNPURGED stylesheet (tachyons + src/css/style.css, imports resolved) to
// public/css/style.css. For each page this script purges that stylesheet
// against the page's own markup, minifies it with cssnano, and swaps the
// <link> for the result in a <style>, so a page only carries the rules it
// can use. The shared stylesheet is deleted afterwards.
const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const purgecss = require('@fullhuman/postcss-purgecss');
const cssnano = require('cssnano');

const pub = path.join(__dirname, '..', 'public');
const cssPath = path.join(pub, 'css', 'style.css');
const LINK = /<link\b(?=[^>]*\brel=["']?stylesheet["']?[\s>/])(?=[^>]*\bhref=["']?\/css\/style\.css["']?[\s>/])[^>]*>/i;

function pages(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return pages(p);
    return e.name.endsWith('.html') ? [p] : [];
  });
}

// Only real markup counts: tag names, class tokens, ids and attributes. The
// default PurgeCSS extractor treats every word of the page text as a
// possible class, so prose like "white" or "grow" keeps `.white` and `.grow`.
// Handles quoted (class="a b") and the minifier's unquoted (class=a) values.
const TAG = /<([a-zA-Z][a-zA-Z0-9-]*)/g;
const ATTR = /\s([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
function extract(html) {
  const tags = new Set();
  const classes = new Set();
  const ids = new Set();
  const names = new Set();
  const values = new Set();
  // Drop text, comments, and script/style bodies; keep only tags.
  const markup = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, '');
  for (const tag of markup.match(/<[a-zA-Z][^>]*>/g) || []) {
    tags.add(tag.match(/<([a-zA-Z][a-zA-Z0-9-]*)/)[1].toLowerCase());
    for (const m of tag.slice(1).matchAll(ATTR)) {
      const name = m[1].toLowerCase();
      const value = m[2] ?? m[3] ?? m[4];
      names.add(name);
      if (value === undefined) continue;
      values.add(value);
      if (name === 'class') value.split(/\s+/).filter(Boolean).forEach((c) => classes.add(c));
      else if (name === 'id') ids.add(value);
    }
  }
  return { attributes: { names: [...names], values: [...values] }, classes: [...classes], ids: [...ids], tags: [...tags], undetermined: [] };
}

async function build(source, html, from) {
  const result = await postcss([
    purgecss({
      content: [{ raw: html, extension: 'html' }],
      extractors: [{ extractor: extract, extensions: ['html'] }],
    }),
    // Default preset. It keeps the `/*!` licence comments of tachyons and
    // normalize.css on purpose; `discardComments: {removeAll: true}` at the
    // top level was silently ignored here (it belongs inside `preset`).
    cssnano(),
  ]).process(source, { from });
  return result.css.trim();
}

async function main() {
  const files = pages(pub);
  if (!fs.existsSync(cssPath)) {
    // Idempotent: a second run finds nothing left to do.
    if (files.every((f) => !LINK.test(fs.readFileSync(f, 'utf8')))) {
      console.log('inline-css: already inlined');
      return;
    }
    throw new Error('public/css/style.css is missing');
  }
  const source = fs.readFileSync(cssPath, 'utf8');

  const out = [];
  let bytes = 0;
  for (const f of files) {
    const html = fs.readFileSync(f, 'utf8');
    if (!LINK.test(html)) throw new Error(`stylesheet link not found in ${path.relative(pub, f)}`);
    const css = await build(source, html, cssPath);
    if (!css) throw new Error(`no CSS survived purging for ${path.relative(pub, f)}`);
    if (/<\/style/i.test(css)) throw new Error('CSS contains "</style" and cannot be inlined safely');
    out.push([f, html, css]);
    bytes += css.length;
  }
  // Write only after every page built, so a failure leaves public/ untouched.
  for (const [f, html, css] of out) {
    // Function replacer so "$" sequences in the CSS are not interpreted.
    fs.writeFileSync(f, html.replace(LINK, () => `<style>${css}</style>`));
  }

  fs.rmSync(cssPath);
  try {
    fs.rmdirSync(path.dirname(cssPath));
  } catch (e) {
    // directory not empty: leave it
  }
  console.log(`inline-css: inlined ${bytes} bytes of CSS across ${files.length} pages`);
}

main().catch((e) => {
  console.error(`inline-css: ${e.message}`);
  process.exit(1);
});
