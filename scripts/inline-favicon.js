// Replaces the 16x16 and 32x32 favicon links in every built page with a single
// data: URI built from public/favicon-32x32.png, so a page view makes no
// favicon request. Runs after the webpack build, once the icon has been copied
// into public/. The icon files stay in place for /favicon.ico-style fallbacks.
const fs = require('fs');
const path = require('path');

const pub = path.join(__dirname, '..', 'public');
const iconPath = path.join(pub, 'favicon-32x32.png');

// Matches <link rel=icon ... href=/favicon-<size>.png>, quoted or not.
const LINK = /<link\b(?=[^>]*\brel=["']?icon["']?[\s>/])(?=[^>]*\bhref=["']?\/favicon-(?:16x16|32x32)\.png["']?[\s>/])[^>]*>/gi;

function pages(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return pages(p);
    return e.name.endsWith('.html') ? [p] : [];
  });
}

const files = pages(pub);
if (files.every((f) => !fs.readFileSync(f, 'utf8').match(LINK))) {
  console.log('inline-favicon: already inlined');
  process.exit(0);
}

const icon = `<link rel=icon type=image/png href="data:image/png;base64,${fs.readFileSync(iconPath).toString('base64')}">`;

for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  if (!html.match(LINK)) {
    console.error(`inline-favicon: favicon links not found in ${path.relative(pub, f)}`);
    process.exit(1);
  }
  // Put the data URI where the first icon link was and drop the rest.
  let first = true;
  const out = html.replace(LINK, () => {
    if (!first) return '';
    first = false;
    return icon;
  });
  fs.writeFileSync(f, out);
}
console.log(`inline-favicon: inlined ${path.basename(iconPath)} into ${files.length} pages`);
