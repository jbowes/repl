// Inlines public/css/style.css into every built page so first paint does
// not wait on a second request. Runs after `npm run css`.
const fs = require('fs');
const path = require('path');

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

const files = pages(pub);
if (!fs.existsSync(cssPath)) {
  // Idempotent: a second run finds nothing left to do.
  if (files.every((f) => !LINK.test(fs.readFileSync(f, 'utf8')))) {
    console.log('inline-css: already inlined');
    process.exit(0);
  }
  console.error('inline-css: public/css/style.css is missing');
  process.exit(1);
}

const css = fs.readFileSync(cssPath, 'utf8').trim();
if (/<\/style/i.test(css)) {
  console.error('inline-css: CSS contains "</style" and cannot be inlined safely');
  process.exit(1);
}

for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  if (!LINK.test(html)) {
    console.error(`inline-css: stylesheet link not found in ${path.relative(pub, f)}`);
    process.exit(1);
  }
  // Function replacer so "$" sequences in the CSS are not interpreted.
  fs.writeFileSync(f, html.replace(LINK, () => `<style>${css}</style>`));
}

fs.rmSync(cssPath);
try {
  fs.rmdirSync(path.dirname(cssPath));
} catch (e) {
  // directory not empty: leave it
}
console.log(`inline-css: inlined ${css.length} bytes into ${files.length} pages`);
