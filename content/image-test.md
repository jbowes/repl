---
title: "Image test page"
date: 2026-11-12T12:00:00-04:00
summary: |
  Demo of markdown image support and the inlining cutoff. Remove before merging.
description: |
  Demo of markdown image support and the inlining cutoff.
---

Images at or under 4096 bytes are inlined as `data:` URIs. Larger ones are emitted to `/images/` with a content hash and lazy loading.

A small WebP, inlined as base64:

![Tiny test WebP, inlined](images/small.webp)

A small SVG (inlined, URL-encoded rather than base64):

![Tiny test SVG, inlined](images/small.svg)

A large WebP, emitted as a hashed file with `loading="lazy"`:

![Larger test WebP, served as a file](images/large.webp "With a title")

A remote image passes through untouched:

![Remote mushroom](https://repl.ca/social-mushroom.jpg)
