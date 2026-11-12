// Checks that images under content/images/ are fit to commit: WebP (or SVG
// and GIF, which sharp cannot improve on) with no embedded metadata, so no
// EXIF geotags, camera details or XMP leak onto the site. Run by the
// pre-commit hook (.githooks/pre-commit) and CI; the build itself trusts
// whatever is committed.
//
//   node scripts/check-images.js            check every image
//   node scripts/check-images.js --staged   check only staged images
//   node scripts/check-images.js --fix      convert PNG/JPEG to WebP, strip
//                                           metadata, and update posts
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.join(__dirname, '..');
const dir = path.join('content', 'images');
const QUALITY = 80;

const OK = new Set(['.webp', '.svg', '.gif']);
const CONVERT = new Set(['.png', '.jpg', '.jpeg']);

function listAll() {
  if (!fs.existsSync(path.join(root, dir))) return [];
  return fs.readdirSync(path.join(root, dir)).sort().map((f) => path.join(dir, f));
}

function listStaged() {
  return execFileSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACM', '--', dir], {
    cwd: root,
    encoding: 'utf8',
  }).split('\n').filter(Boolean);
}

// Returns a list of problems with `file` (relative to the repo root).
async function problems(file) {
  const ext = path.extname(file).toLowerCase();
  if (CONVERT.has(ext)) return [`${file}: must be WebP, not ${ext} (run npm run images:fix)`];
  if (!OK.has(ext)) return [`${file}: unsupported type "${ext}"`];
  if (ext !== '.webp') return [];

  const meta = await sharp(path.join(root, file)).metadata();
  const found = ['exif', 'xmp', 'iptc', 'tifftagPhotoshop'].filter((k) => meta[k]);
  return found.length
    ? [`${file}: has embedded metadata (${found.join(', ')}); run npm run images:fix`]
    : [];
}

async function toWebp(file) {
  const abs = path.join(root, file);
  const ext = path.extname(file).toLowerCase();
  const out = abs.slice(0, -ext.length) + '.webp';
  // rotate() applies the EXIF orientation before the tags are dropped, so the
  // image does not come out sideways. sharp keeps no metadata unless asked.
  const buf = await sharp(abs)
    .rotate()
    .webp(ext === '.png' ? { lossless: true, effort: 6 } : { quality: QUALITY, effort: 6 })
    .toBuffer();
  fs.writeFileSync(out, buf);
  if (out !== abs) fs.unlinkSync(abs);
  return path.relative(root, out);
}

function updatePosts(from, to) {
  const posts = path.join(root, 'content');
  for (const f of fs.readdirSync(posts).filter((n) => n.endsWith('.md'))) {
    const p = path.join(posts, f);
    const text = fs.readFileSync(p, 'utf8');
    const next = text.split(`images/${path.basename(from)}`).join(`images/${path.basename(to)}`);
    if (next !== text) fs.writeFileSync(p, next);
  }
}

async function fix(files) {
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (CONVERT.has(ext)) {
      const out = await toWebp(file);
      updatePosts(file, out);
      console.log(`${file} -> ${out}`);
    } else if (ext === '.webp' && (await problems(file)).length) {
      // Re-encoding lossy WebP is lossy again, hence the higher quality.
      const abs = path.join(root, file);
      const buf = await sharp(abs).rotate().webp({ quality: 90, effort: 6 }).toBuffer();
      fs.writeFileSync(abs, buf);
      console.log(`${file}: metadata stripped`);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const files = args.includes('--staged') ? listStaged() : listAll();

  if (args.includes('--fix')) {
    await fix(files);
    return;
  }

  const found = (await Promise.all(files.map(problems))).flat();
  if (found.length) {
    console.error(found.join('\n'));
    process.exit(1);
  }
  console.log(`check-images: ${files.length} images ok`);
}

module.exports = { problems };

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
