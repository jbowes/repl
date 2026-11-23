// Builds the site into public/ (or `out`): every page rendered from src/, the
// images the posts reference, the sitemap, and the files in static/. The
// stylesheet is separate (`npm run css`), so that `npm run release` can inline it.
require('./register');

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BASE = 'https://repl.ca';

// Renders the route with the site's `(locals, callback)` export.
function renderPage(render, route) {
  return new Promise((resolve, reject) =>
    render({ path: route }, (err, html) => (err ? reject(err) : resolve(html)))
  );
}

// React writes void elements as `<meta ... />` and keeps the camel case of a
// few attribute names; HTML wants neither. Only these tags are touched: inline
// SVG needs its `/>`. Attribute values are escaped by React, so a tag has no
// stray `>` in it.
const VOID_TAG = /<(?:meta|link|img|source|br|hr|input)\b[^>]*>/g;
function tidyHtml(html) {
  return html.replace(VOID_TAG, (tag) =>
    tag.replace(/\s*\/>$/, '>').replace(/ (charSet|srcSet|dateTime)=/g, (_, name) => ` ${name.toLowerCase()}=`)
  );
}

function pageName(route) {
  const name = route.replace(/^[/\\]/, '');
  return /\.html?$/i.test(name) ? name : path.join(name, 'index.html');
}

function write(out, name, data) {
  const file = path.join(out, name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
}

// Emits the images that markdown posts reference (see src/images.js). `images`
// is the Map of output path to { file, width, format } the posts filled in. A
// `width` means a smaller copy: the file resized to that width. A `format` of
// 'avif' means an AVIF at `avifQuality`, at that width or full size. Otherwise
// a copy is in its own format at `quality` (WebP and JPEG; PNG stays lossless).
// Re-encoding leaves no metadata behind.
async function emitImages(out, images, { quality, avifQuality }) {
  let sharp; // only loaded when something needs resizing
  for (const [name, { file, width, format }] of images) {
    let data;
    if (width || format) {
      sharp = sharp || require('sharp');
      const img = sharp(file);
      if (width) img.resize({ width, withoutEnlargement: true });
      const ext = path.extname(name).toLowerCase();
      if (format === 'avif') img.avif({ quality: avifQuality });
      else if (ext === '.webp') img.webp({ quality });
      else if (ext === '.jpg' || ext === '.jpeg') img.jpeg({ quality, mozjpeg: true });
      data = await img.toBuffer();
    } else {
      data = fs.readFileSync(file);
    }
    write(out, name, data);
  }
}

const xmlEscape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Posts weekly at 0.8, the home page at 0.5.
function sitemap(routes) {
  const lastmod = new Date(new Date().toISOString().slice(0, 10)).toISOString();
  const urls = routes
    .filter((r) => r !== '/')
    .map((r) => ({ path: `/${r}/`, priority: 0.8 }))
    .concat([{ path: '/', priority: 0.5 }])
    .map(({ path: p, priority }) =>
      `<url><loc>${xmlEscape(BASE + p)}</loc><lastmod>${lastmod}</lastmod>` +
      `<changefreq>weekly</changefreq><priority>${priority}</priority></url>`
    );
  return '<?xml version="1.0" encoding="UTF-8"?>' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + urls.join('') + '</urlset>';
}

async function build({ out = path.join(ROOT, 'public') } = {}) {
  process.env.NODE_ENV = 'production'; // for react-dom/server

  const site = require('../src');
  const { emittedImages, COPY_QUALITY, AVIF_QUALITY } = require('../src/images');
  const render = site.default;
  const routes = site.staticRoutes();

  // don't carry stale files over between builds
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });

  for (const route of routes) {
    write(out, pageName(route), tidyHtml(await renderPage(render, route)));
  }
  // after the pages: rendering the posts is what fills in the image list
  await emitImages(out, emittedImages(), { quality: COPY_QUALITY, avifQuality: AVIF_QUALITY });
  write(out, 'sitemap.xml', sitemap(routes));
  fs.cpSync(path.join(ROOT, 'static'), out, { recursive: true });
}

module.exports = { build };

if (require.main === module) {
  build().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
