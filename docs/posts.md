# Posts

Posts are markdown files in `content/`, with YAML front matter: `title`, `date`,
`summary` and `description` (the meta description, best kept under about 155
characters). `image` and `image_alt` are optional and set the post's social
preview image, a path relative to the post such as `images/photo.webp`, with
alt text required. It is always served as a file, and cannot be an SVG. Without
it a post uses the site's default image. The image, its size and the post's
description also go into the page's schema.org JSON-LD.

## Images

Put images in `content/images/` and refer to them relative to the post:
`![alt text](images/photo.webp)`. Alt text is required. They must be WebP (or
SVG) with no metadata, which `npm run images:fix` does and the pre-commit hook
and CI check, so the build only ever sees finished images.

An image of at most 4 KB is inlined as a `data:` URI. A larger one is emitted
as a file under `/images/` with a content hash in its name, lazy loaded and
with its width and height set so the page does not shift.

A larger PNG, JPEG or WebP is served as a `<picture>`, so a phone is not sent a
desktop-sized photo and a browser that shows AVIF gets one:

```html
<picture>
  <source type="image/avif" srcset="photo-ab12cd34-480w.avif 480w, ... photo-ab12cd34.avif 1400w" sizes="...">
  <img src="photo-ab12cd34.webp" srcset="photo-ab12cd34-480w.webp 480w, ..." sizes="..." alt="..." width="1400" height="695">
</picture>
```

- **Widths.** At build time the image is resized to each of 480, 720, 880 and
  1080 px wide that is narrower than it (`RESPONSIVE_WIDTHS` in
  `src/images.js`), so a 1400 px photo has five candidates, those four and
  itself, and a 400 px one has only itself. The copies are named for the same
  hash, for example `photo-ab12cd34-720w.webp`.
- **AVIF.** Every size, the full one too, is also made as an AVIF at quality 55
  (`AVIF_QUALITY`). That is about what WebP is at 72, for 30-50% fewer bytes,
  and every current browser shows it. The copies in the image's own format are
  the fallback, at quality 72 for WebP and JPEG (`COPY_QUALITY`; PNG stays
  lossless). The full-size original in its own format is copied as it is.
- **Sizes.** `sizes` tells the browser how wide the post column is: 90% of the
  viewport below 48em, and from there two thirds of it less 2rem of padding.
  If the column changes in `src/css/style.css`, change `COLUMN` in
  `src/images.js` to match; a test fails until they agree.
- **At most 2x.** Phone screens run at 2.5-3.5x, but past 2x a photo looks no
  sharper and costs half as much again or more. So below the wide column a
  screen of 3x is told the slot is 60vw rather than 90vw, and one of 2.5x 72vw,
  which the browser multiplies back up to about twice the real slot
  (`DPR_CAP`). A 390 px phone at 3x is sent the 720 px copy rather than the
  1080 px one.

SVG and GIF are left alone, since an SVG scales by itself and resizing a GIF
would flatten an animation. A post's social preview image is one fixed file
and gets no copies.
