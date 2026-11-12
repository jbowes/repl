---
title: "Image test page"
date: 2026-11-12T12:00:00-04:00
summary: |
  Demo of markdown image support and the inlining cutoff. Remove before merging.
description: |
  Demo of markdown image support and the inlining cutoff.
---

Images at or under 4096 bytes are inlined as `data:` URIs. Larger ones are emitted to `/images/` with a content hash and lazy loading.

A small PNG (294 bytes), inlined as base64:

![Tiny test PNG, inlined](images/small.png)

A small SVG (inlined, URL-encoded rather than base64):

![Tiny test SVG, inlined](images/small.svg)

A large PNG (7010 bytes), emitted as a hashed file with `loading="lazy"`:

![Larger test PNG, served as a file](images/large.png "With a title")

A remote image passes through untouched:

![Remote favicon](https://repl.ca/favicon-32x32.png)
