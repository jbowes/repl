---
title: "Schematic Test"
date: 2026-11-12T12:00:00-04:00
summary: |
  A demo of plan, elevation and isometric schematics.
description: |
  A demo of plan, elevation and isometric schematics drawn from YAML at build time.
---

A Gamegenic Sidekick Pro XL, the Commander-sized deck box, drawn from one
YAML source. The box is a hollow shell: a plan with the lid off, a front
elevation with the lid on, a section cut through the middle, and an
isometric view with the lid lifted clear so the empty compartment shows.

The three outer dimensions, 110 x 104 x 102 mm (W x D x H), come from retailer
listings and are unverified: one retailer lists 85 x 100 x 102 mm, so the
width in particular is disputed, and the manufacturer does not publish
dimensions. Everything inside that, namely the wall thickness, the drawer
tier, the card case, the lid and how far it is lifted, is approximate and for
illustration only. Gamegenic does not publish sizes for those parts, so they
carry no dimension lines and should not be read as a spec.

The small token tray, drawn pulled out to the left of the box, and the two
scoops are also guesses: the tray (about 70 x 70 x 26 mm), the round thumb
scoop in the compartment's left wall and the U-shaped scoop in the tray wall
facing the box were estimated from a product photo, not from any published
dimensions. The section is cut through the thumb scoop, so the left wall is
shown lowered there.

```schematic alt="Plan, front, section and isometric views of a hollow Sidekick Pro XL deck box, 110 by 104 by 102 millimetres"
# Gamegenic Sidekick Pro XL, a Magic: The Gathering Commander deck box.
#
# SOURCES AND HONESTY
# - The three OUTER dimensions, 110 x 104 x 102 mm (W x D x H), come from
#   retailer listings and are unverified. The manufacturer does not publish
#   dimensions. One retailer lists 85 x 100 x 102 mm, so the width is disputed.
# - Everything below the outer size is APPROXIMATE and illustrative only: the
#   wall thickness (3 mm), the 26 mm drawer tier under the compartment, the
#   10 mm card case, the 26 mm lid and the 36 mm lift in the exploded view are
#   guesses, not a spec, and carry no dimension lines.
# - The token tray (about 70 x 70 x 26 mm, 2.5 mm walls) and the two scoops
#   (a 36 mm round thumb scoop in the compartment's left wall, a 30 x 16 mm
#   U-shaped scoop in the tray wall facing the box) are ESTIMATED FROM A
#   PRODUCT PHOTO, not published specs, and carry no dimension lines. The
#   tray is drawn pulled out to the left in plan and iso; where it sits when
#   closed (the drawer slot) is not modelled, the 26 mm floor stands for it.
# - Features per the manufacturer: a removable cover that clips onto the
#   bottom, a front slide-in card case (UV protective, shows the commander
#   card), an integrated drawer for tokens and dice, magnets closing the lid,
#   capacity 100 double-sleeved cards.
#
# The box is hollow: the body is an open-top shell with a deck compartment in
# the middle. The plan shows it with the lid off; the section cuts it through
# the middle (the card case is on the removed near half); the isometric view
# lifts the lid clear (exploded) so the inside shows; the front elevation is
# closed up.
#
# Axes: x is width (left to right), y is depth (the front, with the slide-in
# card case, faces +y), z is height.
units: mm
scale: 2.2
views: [plan, front, section, iso]
columns: 1
shapes:
  # Approximate: the body, a hollow open-top shell. The 26 mm floor stands for
  # the token drawer tier under the deck compartment.
  - { type: box, id: body, at: [0, 0, 0], size: [110, 94, 76], wall: 3, floor: 26, style: blue,
      scoops: [{ side: -x, at: 47, width: 36, shape: round }] }  # thumb scoop, estimated from a photo
  # Approximate, estimated from a photo: the small token tray, a separate open-top
  # tray shown pulled out to the left (plan and iso only), with a U-shaped scoop
  # in the wall that faces the box.
  - type: box
    id: tray
    label: tray (approx.)
    views: [plan, iso]
    at: [-135, 35, 0]
    size: [70, 70, 26]
    wall: 2.5
    style: yellow
    scoops: [{ side: +x, at: 35, width: 30, depth: 16, shape: u }]
  # Approximate: the front slide-in card case, a thin slab on the front face.
  - { type: box, id: card-case, at: [0, 94, 26], size: [110, 10, 50], style: green }
  # Approximate: the magnetic lid. Closed in the elevation...
  - { type: box, id: lid, views: [front, section], at: [0, 0, 76], size: [110, 104, 26], style: orange }
  # ...and lifted off in the isometric view, with guide lines to where it seats.
  - { type: box, id: lid-lifted, views: [iso], at: [0, 0, 201], size: [110, 104, 26], style: orange }
  - { type: line, views: [iso], dashed: true, points: [[0, 104, 76], [0, 104, 201]] }
  - { type: line, views: [iso], dashed: true, points: [[110, 104, 76], [110, 104, 201]] }
  - { type: line, views: [iso], dashed: true, points: [[110, 0, 76], [110, 0, 201]] }

  # The only dimensions: the outer width and depth, and the closed height.
  - { type: dim, views: [plan, iso], from: [0, 104, 0], to: [110, 104, 0], offset: [0, 24, 0] }
  - { type: dim, views: [plan, iso], from: [110, 0, 0], to: [110, 104, 0], offset: [24, 0, 0] }
  - { type: dim, views: [front], from: [0, 104, 0], to: [110, 104, 0], offset: [0, 0, -24] }
  - { type: dim, views: [front], from: [110, 104, 0], to: [110, 104, 102], offset: [24, 0, 0] }

  # Callouts name the approximate parts.
  - { type: label, views: [plan], at: [55, 20, 76], to: [30, -22, 76], text: deck compartment (hollow) }
  - { type: label, views: [plan], at: [1.5, 47, 76], to: [-45, -12, 76], text: thumb scoop (approx.) }
  - { type: label, views: [plan], at: [-65, 70, 26], to: [-85, 96, 26], text: scoop }
  - { type: label, views: [plan], at: [20, 99, 76], to: [-35, 112, 76], text: card case (approx.) }
  - { type: label, views: [section], at: [1.5, 52, 45], to: [-45, 52, 60], text: "wall, scoop cut (approx.)" }
  - { type: label, views: [section], at: [55, 52, 13], to: [-45, 52, 13], text: floor / drawer tier (approx.) }
  - { type: label, views: [section], at: [55, 52, 52], to: [118, 52, 52], text: hollow deck compartment }
  - { type: label, views: [section], at: [55, 52, 89], to: [118, 52, 100], text: lid (approx.) }
  - { type: label, views: [front], at: [0, 104, 90], to: [-30, 104, 110], text: lid (approx.) }
  - { type: label, views: [front], at: [0, 104, 51], to: [-30, 104, 60], text: slide-in card case (approx.) }
  - { type: label, views: [front], at: [0, 104, 13], to: [-30, 104, 22], text: token drawer (approx.) }
  - { type: label, views: [iso], at: [0, 104, 214], to: [-40, 150, 230], text: "lid, lifted (approx.)" }
  - { type: label, views: [iso], at: [30, 104, 51], to: [-40, 150, 0], text: card case (approx.) }
  - { type: label, views: [iso], at: [55, 47, 40], to: [-40, 40, 90], text: hollow deck compartment }
  - { type: label, views: [iso], at: [1.5, 47, 60], to: [-120, 111, 125], text: thumb scoop (approx.) }
```

The same source as a single isometric view, using `view="iso"` on the fence:

```schematic alt="Isometric view of a hollow Sidekick Pro XL deck box with its lid lifted off" view="iso"
# Gamegenic Sidekick Pro XL, a Magic: The Gathering Commander deck box.
#
# SOURCES AND HONESTY
# - The three OUTER dimensions, 110 x 104 x 102 mm (W x D x H), come from
#   retailer listings and are unverified. The manufacturer does not publish
#   dimensions. One retailer lists 85 x 100 x 102 mm, so the width is disputed.
# - Everything below the outer size is APPROXIMATE and illustrative only: the
#   wall thickness (3 mm), the 26 mm drawer tier under the compartment, the
#   10 mm card case, the 26 mm lid and the 36 mm lift in the exploded view are
#   guesses, not a spec, and carry no dimension lines.
# - The token tray (about 70 x 70 x 26 mm, 2.5 mm walls) and the two scoops
#   (a 36 mm round thumb scoop in the compartment's left wall, a 30 x 16 mm
#   U-shaped scoop in the tray wall facing the box) are ESTIMATED FROM A
#   PRODUCT PHOTO, not published specs, and carry no dimension lines. The
#   tray is drawn pulled out to the left in plan and iso; where it sits when
#   closed (the drawer slot) is not modelled, the 26 mm floor stands for it.
# - Features per the manufacturer: a removable cover that clips onto the
#   bottom, a front slide-in card case (UV protective, shows the commander
#   card), an integrated drawer for tokens and dice, magnets closing the lid,
#   capacity 100 double-sleeved cards.
#
# The box is hollow: the body is an open-top shell with a deck compartment in
# the middle. The plan shows it with the lid off; the section cuts it through
# the middle (the card case is on the removed near half); the isometric view
# lifts the lid clear (exploded) so the inside shows; the front elevation is
# closed up.
#
# Axes: x is width (left to right), y is depth (the front, with the slide-in
# card case, faces +y), z is height.
units: mm
scale: 2.2
views: [plan, front, section, iso]
columns: 1
shapes:
  # Approximate: the body, a hollow open-top shell. The 26 mm floor stands for
  # the token drawer tier under the deck compartment.
  - { type: box, id: body, at: [0, 0, 0], size: [110, 94, 76], wall: 3, floor: 26, style: blue,
      scoops: [{ side: -x, at: 47, width: 36, shape: round }] }  # thumb scoop, estimated from a photo
  # Approximate, estimated from a photo: the small token tray, a separate open-top
  # tray shown pulled out to the left (plan and iso only), with a U-shaped scoop
  # in the wall that faces the box.
  - type: box
    id: tray
    label: tray (approx.)
    views: [plan, iso]
    at: [-135, 35, 0]
    size: [70, 70, 26]
    wall: 2.5
    style: yellow
    scoops: [{ side: +x, at: 35, width: 30, depth: 16, shape: u }]
  # Approximate: the front slide-in card case, a thin slab on the front face.
  - { type: box, id: card-case, at: [0, 94, 26], size: [110, 10, 50], style: green }
  # Approximate: the magnetic lid. Closed in the elevation...
  - { type: box, id: lid, views: [front, section], at: [0, 0, 76], size: [110, 104, 26], style: orange }
  # ...and lifted off in the isometric view, with guide lines to where it seats.
  - { type: box, id: lid-lifted, views: [iso], at: [0, 0, 201], size: [110, 104, 26], style: orange }
  - { type: line, views: [iso], dashed: true, points: [[0, 104, 76], [0, 104, 201]] }
  - { type: line, views: [iso], dashed: true, points: [[110, 104, 76], [110, 104, 201]] }
  - { type: line, views: [iso], dashed: true, points: [[110, 0, 76], [110, 0, 201]] }

  # The only dimensions: the outer width and depth, and the closed height.
  - { type: dim, views: [plan, iso], from: [0, 104, 0], to: [110, 104, 0], offset: [0, 24, 0] }
  - { type: dim, views: [plan, iso], from: [110, 0, 0], to: [110, 104, 0], offset: [24, 0, 0] }
  - { type: dim, views: [front], from: [0, 104, 0], to: [110, 104, 0], offset: [0, 0, -24] }
  - { type: dim, views: [front], from: [110, 104, 0], to: [110, 104, 102], offset: [24, 0, 0] }

  # Callouts name the approximate parts.
  - { type: label, views: [plan], at: [55, 20, 76], to: [30, -22, 76], text: deck compartment (hollow) }
  - { type: label, views: [plan], at: [1.5, 47, 76], to: [-45, -12, 76], text: thumb scoop (approx.) }
  - { type: label, views: [plan], at: [-65, 70, 26], to: [-85, 96, 26], text: scoop }
  - { type: label, views: [plan], at: [20, 99, 76], to: [-35, 112, 76], text: card case (approx.) }
  - { type: label, views: [section], at: [1.5, 52, 45], to: [-45, 52, 60], text: "wall, scoop cut (approx.)" }
  - { type: label, views: [section], at: [55, 52, 13], to: [-45, 52, 13], text: floor / drawer tier (approx.) }
  - { type: label, views: [section], at: [55, 52, 52], to: [118, 52, 52], text: hollow deck compartment }
  - { type: label, views: [section], at: [55, 52, 89], to: [118, 52, 100], text: lid (approx.) }
  - { type: label, views: [front], at: [0, 104, 90], to: [-30, 104, 110], text: lid (approx.) }
  - { type: label, views: [front], at: [0, 104, 51], to: [-30, 104, 60], text: slide-in card case (approx.) }
  - { type: label, views: [front], at: [0, 104, 13], to: [-30, 104, 22], text: token drawer (approx.) }
  - { type: label, views: [iso], at: [0, 104, 214], to: [-40, 150, 230], text: "lid, lifted (approx.)" }
  - { type: label, views: [iso], at: [30, 104, 51], to: [-40, 150, 0], text: card case (approx.) }
  - { type: label, views: [iso], at: [55, 47, 40], to: [-40, 40, 90], text: hollow deck compartment }
  - { type: label, views: [iso], at: [1.5, 47, 60], to: [-120, 111, 125], text: thumb scoop (approx.) }
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
