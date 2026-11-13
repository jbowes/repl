import { createHash } from 'crypto';
import { existsSync, readFileSync } from 'fs';
import { basename, dirname, extname, relative, resolve } from 'path';

// Images at or below this many bytes are inlined as data: URIs; larger ones
// are emitted as content-hashed files. 4 KiB is about where the saved request
// stops paying for the ~33% base64 growth (and for bytes that cannot be cached
// separately from the page). It is a fixed count of source bytes, never
// derived from the encoded size, so the same input always gives the same
// output.
export const INLINE_LIMIT = 4096;

// Emitted raster images also get smaller copies for a srcset: each of these
// widths that is narrower than the image, plus the image itself. The browser
// picks by the `sizes` below, which describes the post column in
// src/css/style.css: 90% of the viewport, and from 48em two thirds of it less
// 2rem of padding. A test checks the two agree. The copies are made when the
// images are emitted (webpack/images-plugin.js).
export const RESPONSIVE_WIDTHS = [480, 800, 1200];
export const SIZES = '(min-width: 48em) calc(66.667vw - 2rem), 90vw';
// The quality the smaller copies are re-encoded at (WebP and JPEG; PNG is
// lossless). A copy is shown smaller than the committed original, where the
// difference from 80 is not visible, and this saves about 20% of its bytes.
export const COPY_QUALITY = 72;
const RESIZABLE = new Set(['.png', '.jpg', '.jpeg', '.webp']);

// Directory (under public/) that file images are emitted to.
export const OUTPUT_DIR = 'images';

const MIME = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

// Files that need emitting to public/ (output path -> { file, width }). `width`
// is set for a smaller copy, which is the source file resized to that width.
// Filled while the markdown is processed; the webpack plugin reads it afterwards.
const emitted = new Map();

export function emittedImages() {
  return emitted;
}

function pngSize(b) {
  if (b.toString('latin1', 1, 4) !== 'PNG') return null;
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

function gifSize(b) {
  return { width: b.readUInt16LE(6), height: b.readUInt16LE(8) };
}

function jpegSize(b) {
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const marker = b[i + 1];
    // SOF0-SOF15, except DHT (c4), JPG (c8) and DAC (cc), carry the size.
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
    }
    i += 2 + b.readUInt16BE(i + 2);
  }
  return null;
}

function webpSize(b) {
  const kind = b.toString('latin1', 12, 16);
  if (kind === 'VP8 ') {
    return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
  }
  if (kind === 'VP8L') {
    const bits = b.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (kind === 'VP8X') {
    return { width: b.readUIntLE(24, 3) + 1, height: b.readUIntLE(27, 3) + 1 };
  }
  return null;
}

function svgSize(b) {
  const tag = (/<svg\b[^>]*>/i.exec(b.toString('utf8')) || [''])[0];
  const attr = (name) => {
    const m = new RegExp(`\\s${name}\\s*=\\s*["']\\s*([\\d.]+)(?:px)?\\s*["']`, 'i').exec(tag);
    return m ? Math.round(parseFloat(m[1])) : null;
  };
  let width = attr('width');
  let height = attr('height');
  if (!width || !height) {
    const vb = /viewBox\s*=\s*["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(tag);
    if (vb) {
      width = Math.round(parseFloat(vb[1]));
      height = Math.round(parseFloat(vb[2]));
    }
  }
  return width && height ? { width, height } : null;
}

export function imageSize(buf, ext) {
  try {
    switch (ext) {
      case '.png': return pngSize(buf);
      case '.gif': return gifSize(buf);
      case '.jpg':
      case '.jpeg': return jpegSize(buf);
      case '.webp': return webpSize(buf);
      case '.svg': return svgSize(buf);
    }
  } catch (e) {
    // truncated file: reported as unreadable below
  }
  return null;
}

export function isLocal(url) {
  return !/^([a-z][a-z0-9+.-]*:|\/|#)/i.test(url);
}

// Resolves `url` relative to the markdown file at `from` and returns the <img>
// attributes. Throws (failing the build) on a missing file, an unsupported
// type, unreadable dimensions, or missing alt text. With `{ file: true }` the
// image is always emitted as a file, never inlined, for uses that need a URL,
// such as a social preview image.
export function processImage(url, alt, from, { file: asFile = false } = {}) {
  const where = `${relative('.', from)}: image "${url}"`;
  if (!alt || !alt.trim()) throw new Error(`${where} needs alt text`);

  const file = resolve(dirname(from), decodeURI(url));
  const ext = extname(file).toLowerCase();
  if (!MIME[ext]) throw new Error(`${where} has an unsupported type "${ext}"`);
  if (!existsSync(file)) throw new Error(`${where} does not exist`);

  const data = readFileSync(file);
  const size = imageSize(data, ext);
  if (!size) throw new Error(`${where}: could not read the image dimensions`);

  const props = { alt, width: size.width, height: size.height };

  if (!asFile && data.length <= INLINE_LIMIT) {
    props.src = ext === '.svg'
      // URL-encoded rather than base64: smaller, and it compresses better.
      ? `data:image/svg+xml,${encodeURIComponent(data.toString('utf8').trim())}`
      : `data:${MIME[ext]};base64,${data.toString('base64')}`;
    return props;
  }

  const hash = createHash('sha256').update(data).digest('hex').slice(0, 8);
  const stem = `${OUTPUT_DIR}/${basename(file, extname(file))}-${hash}`;
  const name = `${stem}${ext}`;
  emitted.set(name, { file });

  props.src = `/${name}`;
  props.loading = 'lazy';
  props.decoding = 'async';

  // Smaller copies, named for the same source hash so a changed image gets new
  // names for all of them. Not for a social image, which is one fixed file.
  const widths = asFile || !RESIZABLE.has(ext) ? [] : RESPONSIVE_WIDTHS.filter((w) => w < size.width);
  if (widths.length) {
    const copies = widths.map((w) => {
      const copy = `${stem}-${w}w${ext}`;
      emitted.set(copy, { file, width: w });
      return `/${copy} ${w}w`;
    });
    props.srcSet = [...copies, `${props.src} ${size.width}w`].join(', ');
    props.sizes = SIZES;
  }
  return props;
}
