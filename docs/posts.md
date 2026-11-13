# Posts

Posts are markdown files in `content/`, with YAML front matter: `title`, `date`,
`summary` and `description` (the meta description, best kept under about 155
characters). `image` and `image_alt` are optional and set the post's social
preview image, a path relative to the post such as `images/photo.webp`, with
alt text required. It is always served as a file, and cannot be an SVG. Without
it a post uses the site's default image. The image, its size and the post's
description also go into the page's schema.org JSON-LD.
