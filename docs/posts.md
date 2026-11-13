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

A larger PNG, JPEG or WebP also gets a `srcset`, so a phone is not sent a
desktop-sized photo. At build time the image is resized to each of 480, 800 and
1200 px wide that is narrower than the image (so a 1400 px photo has four
candidates: those three and itself, a 400 px one has none), each in its own
format and named for the same hash, for example
`photo-ab12cd34-800w.webp`. `sizes` tells the browser how wide the post column
is: 90% of the viewport below 30em, and from there two thirds of it less 2rem
of padding. If the column changes in `src/css/style.css`, change `SIZES` in
`src/images.js` to match. SVG and GIF are left alone, since an SVG scales by
itself and resizing a GIF would flatten an animation. A post's social preview
image is one fixed file and gets no copies.
