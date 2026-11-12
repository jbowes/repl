---
title: "Schematic Test"
date: 2026-11-12T12:00:00-04:00
summary: |
  A demo of plan, elevation and isometric schematics.
description: |
  A demo of plan, elevation and isometric schematics drawn from YAML at build time.
---

A Gamegenic Sidekick Pro XL, the Commander-sized deck box, drawn from one
YAML source as a plan, a front elevation and an isometric view.

The three outer dimensions, 110 x 104 x 102 mm (W x D x H), come from retailer
listings and are unverified: one retailer lists 85 x 100 x 102 mm, so the
width in particular is disputed, and the manufacturer does not publish
dimensions. The split of the box into lid, slide-in card case and token drawer
is approximate and for illustration only. Gamegenic does not publish sizes for
those parts, so they carry no dimension lines and should not be read as a
spec.

```schematic alt="Plan, front elevation and isometric views of a Sidekick Pro XL deck box, 110 by 104 by 102 millimetres"
# Gamegenic Sidekick Pro XL, a Magic: The Gathering Commander deck box.
#
# SOURCES AND HONESTY
# - The three OUTER dimensions, 110 x 104 x 102 mm (W x D x H), come from
#   retailer listings and are unverified. The manufacturer does not publish
#   dimensions. One retailer lists 85 x 100 x 102 mm, so the width is disputed.
# - The split of the body into drawer, card case and lid below is APPROXIMATE
#   and illustrative only. No internal or sub-dimensions of the drawer, slide
#   case or lid are published; the proportions are guesses, not a spec, and
#   carry no dimension lines.
# - Features per the manufacturer: a removable cover that clips onto the
#   bottom, a front slide-in card case (UV protective, shows the commander
#   card), an integrated drawer for tokens and dice, magnets closing the lid,
#   capacity 100 double-sleeved cards.
#
# Axes: x is width (left to right), y is depth (the front, with the slide-in
# card case, faces +y), z is height.
units: mm
scale: 2.2
views: [plan, front, iso]
columns: 1
shapes:
  # Approximate: token and dice drawer, the lower tier.
  - { type: box, id: drawer, at: [0, 0, 0], size: [110, 104, 26], style: orange }
  # Approximate: the main deck compartment behind the card case.
  - { type: box, id: compartment, at: [0, 0, 26], size: [110, 94, 50] }
  # Approximate: the front slide-in card case, a thin slab on the front face.
  - { type: box, id: card-case, at: [0, 94, 26], size: [110, 10, 50], style: green }
  # Approximate: the magnetic lid.
  - { type: box, id: lid, at: [0, 0, 76], size: [110, 104, 26], style: blue }

  # The only dimensions: the three outer measurements (retailer listings).
  - { type: dim, views: [plan, iso], from: [0, 104, 0], to: [110, 104, 0], offset: [0, 24, 0] }
  - { type: dim, views: [plan, iso], from: [110, 0, 0], to: [110, 104, 0], offset: [24, 0, 0] }
  - { type: dim, views: [front], from: [0, 104, 0], to: [110, 104, 0], offset: [0, 0, -24] }
  - { type: dim, views: [front], from: [110, 104, 0], to: [110, 104, 102], offset: [24, 0, 0] }
  - { type: dim, views: [iso], from: [110, 0, 0], to: [110, 0, 102], offset: [24, 0, 0] }

  # Callouts name the approximate parts.
  - { type: label, views: [plan], at: [20, 20, 102], to: [-30, 12, 102], text: lid (approx.) }
  - { type: label, views: [front], at: [0, 104, 90], to: [-30, 104, 110], text: lid (approx.) }
  - { type: label, views: [front], at: [0, 104, 51], to: [-30, 104, 60], text: slide-in card case (approx.) }
  - { type: label, views: [front], at: [0, 104, 13], to: [-30, 104, 22], text: token drawer (approx.) }
  - { type: label, views: [iso], at: [0, 104, 90], to: [-40, 150, 120], text: lid (approx.) }
  - { type: label, views: [iso], at: [30, 104, 51], to: [-40, 150, 70], text: card case (approx.) }
  - { type: label, views: [iso], at: [20, 104, 13], to: [-40, 150, 20], text: drawer (approx.) }
```

The same source as a single isometric view, using `view="iso"` on the fence:

```schematic alt="Isometric view of a Sidekick Pro XL deck box" view="iso"
# Gamegenic Sidekick Pro XL, a Magic: The Gathering Commander deck box.
#
# SOURCES AND HONESTY
# - The three OUTER dimensions, 110 x 104 x 102 mm (W x D x H), come from
#   retailer listings and are unverified. The manufacturer does not publish
#   dimensions. One retailer lists 85 x 100 x 102 mm, so the width is disputed.
# - The split of the body into drawer, card case and lid below is APPROXIMATE
#   and illustrative only. No internal or sub-dimensions of the drawer, slide
#   case or lid are published; the proportions are guesses, not a spec, and
#   carry no dimension lines.
# - Features per the manufacturer: a removable cover that clips onto the
#   bottom, a front slide-in card case (UV protective, shows the commander
#   card), an integrated drawer for tokens and dice, magnets closing the lid,
#   capacity 100 double-sleeved cards.
#
# Axes: x is width (left to right), y is depth (the front, with the slide-in
# card case, faces +y), z is height.
units: mm
scale: 2.2
views: [plan, front, iso]
columns: 1
shapes:
  # Approximate: token and dice drawer, the lower tier.
  - { type: box, id: drawer, at: [0, 0, 0], size: [110, 104, 26], style: orange }
  # Approximate: the main deck compartment behind the card case.
  - { type: box, id: compartment, at: [0, 0, 26], size: [110, 94, 50] }
  # Approximate: the front slide-in card case, a thin slab on the front face.
  - { type: box, id: card-case, at: [0, 94, 26], size: [110, 10, 50], style: green }
  # Approximate: the magnetic lid.
  - { type: box, id: lid, at: [0, 0, 76], size: [110, 104, 26], style: blue }

  # The only dimensions: the three outer measurements (retailer listings).
  - { type: dim, views: [plan, iso], from: [0, 104, 0], to: [110, 104, 0], offset: [0, 24, 0] }
  - { type: dim, views: [plan, iso], from: [110, 0, 0], to: [110, 104, 0], offset: [24, 0, 0] }
  - { type: dim, views: [front], from: [0, 104, 0], to: [110, 104, 0], offset: [0, 0, -24] }
  - { type: dim, views: [front], from: [110, 104, 0], to: [110, 104, 102], offset: [24, 0, 0] }
  - { type: dim, views: [iso], from: [110, 0, 0], to: [110, 0, 102], offset: [24, 0, 0] }

  # Callouts name the approximate parts.
  - { type: label, views: [plan], at: [20, 20, 102], to: [-30, 12, 102], text: lid (approx.) }
  - { type: label, views: [front], at: [0, 104, 90], to: [-30, 104, 110], text: lid (approx.) }
  - { type: label, views: [front], at: [0, 104, 51], to: [-30, 104, 60], text: slide-in card case (approx.) }
  - { type: label, views: [front], at: [0, 104, 13], to: [-30, 104, 22], text: token drawer (approx.) }
  - { type: label, views: [iso], at: [0, 104, 90], to: [-40, 150, 120], text: lid (approx.) }
  - { type: label, views: [iso], at: [30, 104, 51], to: [-40, 150, 70], text: card case (approx.) }
  - { type: label, views: [iso], at: [20, 104, 13], to: [-40, 150, 20], text: drawer (approx.) }
```

A second example exercising a cylinder, a group, a footprint, wires and a
dashed hidden line:

```schematic alt="Plan and isometric views of a tank and a pump on a pad, joined by a pipe"
# A small tank on a pad with a pipe run, to exercise cylinder, rect, line,
# group and the dashed hidden-line style. Invented example, not a real part.
units: mm
scale: 1.6
views: [plan, iso]
shapes:
  - { type: rect, id: pad, at: [0, 0, 0], size: [160, 120], style: yellow, dashed: true }
  - type: group
    at: [40, 40, 0]
    style: green
    shapes:
      - { type: cylinder, id: tank, at: [0, 0, 0], r: 28, h: 80 }
  - { type: box, id: pump, at: [100, 20, 0], size: [40, 30, 30], style: orange }
  - type: line
    id: pipe
    style: blue
    points: [[40, 35, 80], [40, 35, 100], [120, 35, 100], [120, 35, 30]]
  - { type: line, id: buried-return, dashed: true, points: [[120, 60, 0], [120, 100, 0], [40, 100, 0], [40, 68, 0]] }
  - { type: dim, views: [iso], from: [140, 50, 0], to: [140, 50, 30], offset: [30, 0, 0] }
  - { type: dim, views: [plan], from: [0, 120, 0], to: [160, 120, 0], offset: [0, 24, 0] }
  - { type: label, views: [plan, iso], at: [40, 12, 80], to: [-20, -30, 80], text: tank }
  - { type: label, views: [plan], at: [130, 50, 30], to: [165, 80, 30], text: pump }
```
