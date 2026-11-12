---
title: "Schematic Test"
date: 2026-11-12T12:00:00-04:00
summary: |
  A demo of plan, elevation and isometric schematics.
description: |
  A demo of plan, elevation and isometric schematics drawn from YAML at build time.
---

A Gamegenic Sidekick Pro XL, the Commander-sized deck box, drawn from one
YAML source: a plan with the lid off and the token tray pulled out, a front
elevation, a section cut through the middle, and an isometric view with the
lid lifted clear so the empty compartment shows.

What is measured and what is not:

- The box's outer size, 110 x 104 x 102 mm (W x D x H), comes from retailer
  listings and is unverified: one retailer lists 85 x 100 x 102 mm, and the
  manufacturer does not publish dimensions.
- The token tray's outer size (about 80 x 85.7 x 33.7 mm), the cubby it slides
  into (88.5 x 36 x 80 mm), the material thickness (5.3 mm) and the tray's
  thumb scoops (about 26.7 mm wide and 14.7 mm deep, one on each of two
  opposite sides) were measured by the box's owner. They are approximate, not a manufacturer spec, and the tray
  and cubby sizes are the only parts besides the outer size that carry
  dimension lines. The scoop measurements are recorded in the source with
  `hide: true`, so they are in the description but not drawn. The
  tray's inside width and depth are its outer size less two walls; its inside
  height also takes off a floor assumed to be 5.3 mm.
- The walls, base, compartment floor and lid are all assumed to be that same
  5.3 mm material. Where the cubby sits, the tray's floor, the U shape of its
  scoops, the compartment's thumb scoop and the card case are guesses from a
  product photo.
- Known wrong: the real cover is a flap hinged at the bottom front, not a
  lift-off lid, and the card case is a slide-in window, not a solid slab.
  With a 36 mm cubby under it the compartment drawn here is too shallow for a
  sleeved card, so the retailer height probably does not match the measured
  parts.

```schematic alt="Plan, front, section and isometric views of a Sidekick Pro XL deck box with its token tray pulled out of the cubby under the deck compartment"
# Gamegenic Sidekick Pro XL, a Magic: The Gathering Commander deck box.
#
# SOURCES AND HONESTY
# - The three OUTER dimensions, 110 x 104 x 102 mm (W x D x H), come from
#   retailer listings and are unverified. The manufacturer does not publish
#   dimensions. One retailer lists 85 x 100 x 102 mm, so the width is disputed.
# - MEASURED by the owner of the box (approximate, not a manufacturer spec),
#   and so dimensioned on the drawing:
#     the token tray's outer size, about 80 x 85.7 x 33.7 mm (W x D x H);
#     the tray cubby (the slot the tray slides into), 88.5 x 36 x 80 mm
#     (opening width x opening height x depth into the box);
#     the "material width", 5.3 mm, used for the tray's walls;
#     the tray's thumb scoops, one on each of two opposite sides, starting
#     about 29.5 mm from each end of the wall with about 19 mm of wall left
#     under them (so 26.7 mm wide and 14.7 mm deep, assuming they are in the
#     85.7 mm walls).
#   The tray's inside width and depth are the outer size less two walls; its
#   inside height also takes off a floor ASSUMED to be 5.3 mm.
# - ASSUMED from that 5.3 mm material: the body's walls, the slab under the
#   cubby, the compartment floor above it and the lid are all drawn 5.3 mm
#   thick. Nobody measured those.
# - GUESSED, estimated from a product photo, with no dimension lines: where the
#   cubby sits in the box (opening on the left face, 5.3 mm up from the base
#   and in from the back), the tray's floor thickness, the 36 mm round thumb
#   scoop in the compartment's left wall, the U shape of the tray's scoops, the 10 mm card case and the lift
#   of the lid in the exploded view.
# - KNOWN WRONG: the real cover is a flap hinged at the bottom front, not a
#   lift-off lid, and the card case is a slide-in window, not a solid slab.
#   With a 36 mm cubby under it, the compartment drawn here is about 50 mm
#   deep, which is less than a sleeved card is wide, so the retailer height of
#   102 mm probably does not match the measured parts.
# - Features per the manufacturer: a removable cover that clips onto the
#   bottom, a front slide-in card case (UV protective, shows the commander
#   card), an integrated drawer for tokens and dice, magnets closing the lid,
#   capacity 100 double-sleeved cards.
#
# The plan shows the box with the lid off and the tray pulled out to the left;
# the front elevation is closed up, with the cubby as hidden (dash-dot) lines;
# the section cuts through the middle (the card case is on the removed near
# half) and shows the empty cubby and compartment; the isometric view lifts
# the lid clear so the inside shows.
#
# Axes: x is width (left to right), y is depth (the front, with the slide-in
# card case, faces +y), z is height.
units: mm
scale: 2.2
views: [plan, front, section, iso]
columns: 1
cut: 52
shapes:
  # The drawer tier under the compartment, which holds the tray cubby. Outside
  # views see a plain block (the opening is on the far, left face)...
  - { type: box, id: tier, views: [plan, front, iso], at: [0, 0, 0], size: [110, 104, 41.3], style: blue }
  # ...and the section sees what is left once the cubby (x 0 to 80, 36 high) is
  # taken out: the slab under it and the block beside it.
  - { type: box, id: tier-base, views: [section], at: [0, 0, 0], size: [110, 104, 5.3], style: blue }
  - { type: box, id: tier-side, views: [section], at: [80, 0, 5.3], size: [30, 104, 36], style: blue }
  # The cubby as hidden lines where a solid covers it.
  - { type: line, views: [plan], dashed: true, closed: true, points: [[0, 5.3, 5.3], [80, 5.3, 5.3], [80, 93.8, 5.3], [0, 93.8, 5.3]] }
  - { type: line, views: [front], dashed: true, closed: true, points: [[0, 104, 5.3], [80, 104, 5.3], [80, 104, 41.3], [0, 104, 41.3]] }

  # The deck compartment, a hollow open-top shell standing on the tier, with a
  # thumb scoop in its left wall (estimated from a photo).
  - { type: box, id: body, at: [0, 0, 41.3], size: [110, 94, 55.4], wall: 5.3, style: blue,
      scoops: [{ side: -x, at: 47, width: 36, shape: round }] }
  # The token tray, a separate open-top tray shown pulled out of its cubby to
  # the left, with a thumb scoop on both sides. Outer size, wall and scoop size
  # measured; floor and the scoops' U shape estimated.
  - type: box
    id: tray
    label: tray
    views: [plan, section, iso]
    at: [-145, 6.7, 0]
    size: [80, 85.7, 33.7]
    wall: 5.3
    style: yellow
    scoops:
      # 29.5 mm in from each end of the 85.7 mm wall, 19 mm of wall left under it
      - { side: +x, at: 42.85, width: 26.7, depth: 14.7, shape: u }
      - { side: -x, at: 42.85, width: 26.7, depth: 14.7, shape: u }
  # Approximate: the front slide-in card case, a thin slab on the front face.
  - { type: box, id: card-case, at: [0, 94, 41.3], size: [110, 10, 55.4], style: green }
  # Approximate: the lid. Closed in the elevations...
  - { type: box, id: lid, views: [front, section], at: [0, 0, 96.7], size: [110, 104, 5.3], style: orange }
  # ...and lifted off in the isometric view, with guide lines to where it seats.
  - { type: box, id: lid-lifted, views: [iso], at: [0, 0, 190], size: [110, 104, 5.3], style: orange }
  - { type: line, views: [iso], dashed: true, points: [[0, 104, 96.7], [0, 104, 190]] }
  - { type: line, views: [iso], dashed: true, points: [[110, 104, 96.7], [110, 104, 190]] }
  - { type: line, views: [iso], dashed: true, points: [[110, 0, 96.7], [110, 0, 190]] }

  # The box's outer width and depth, and the closed height (retailer listings).
  - { type: dim, views: [plan, iso], from: [0, 104, 0], to: [110, 104, 0], offset: [0, 24, 0] }
  - { type: dim, views: [plan, iso], from: [110, 0, 0], to: [110, 104, 0], offset: [24, 0, 0] }
  - { type: dim, views: [front], from: [0, 104, 0], to: [110, 104, 0], offset: [0, 0, -24] }
  - { type: dim, views: [front], from: [110, 104, 0], to: [110, 104, 102], offset: [24, 0, 0] }

  # The tray's three outer measurements (measured).
  - { type: dim, views: [plan, iso], from: [-145, 92.4, 0], to: [-65, 92.4, 0], offset: [0, 24, 0] }
  - { type: dim, views: [plan], from: [-145, 6.7, 0], to: [-145, 92.4, 0], offset: [-24, 0, 0] }
  - { type: dim, views: [iso], from: [-145, 92.4, 0], to: [-145, 92.4, 33.7], offset: [-24, 0, 0] }
  - { type: dim, views: [section], from: [-145, 52, 0], to: [-145, 52, 33.7], offset: [-20, 0, 0] }

  # The tray's inside: the outer size less the 5.3 mm walls (69.4 x 75.1), and
  # its depth above a floor ASSUMED to be 5.3 mm too (28.4).
  - { type: dim, views: [plan], from: [-139.7, 12, 0], to: [-70.3, 12, 0], offset: [0, -22, 0] }
  - { type: dim, views: [plan], from: [-139.7, 12, 0], to: [-139.7, 87.1, 0], offset: [12, 0, 0] }
  - { type: dim, views: [section], from: [-125, 52, 5.3], to: [-125, 52, 33.7] }
  # The tray's thumb scoops (measured): 29.5 mm in from each end of the wall,
  # so 26.7 mm wide, with 19 mm of wall left under them, so 14.7 mm deep.
  # Recorded but hidden, to keep the drawing clear; the scoops are still drawn.
  - { type: dim, views: [plan], from: [-65, 6.7, 0], to: [-65, 36.2, 0], offset: [14, 0, 0], hide: true }
  - { type: dim, views: [plan], from: [-65, 36.2, 0], to: [-65, 62.9, 0], offset: [32, 0, 0], hide: true }
  - { type: dim, views: [section], from: [-65, 52, 0], to: [-65, 52, 19], offset: [14, 0, 0], hide: true }
  - { type: dim, views: [section], from: [-65, 52, 19], to: [-65, 52, 33.7], offset: [30, 0, 0], hide: true }

  # The cubby's three measurements (measured).
  - { type: dim, views: [plan], from: [0, 5.3, 5.3], to: [0, 93.8, 5.3], offset: [24, 0, 0] }
  - { type: dim, views: [section], from: [0, 52, 0], to: [80, 52, 0], offset: [0, 0, -22] }
  - { type: dim, views: [section], from: [0, 52, 5.3], to: [0, 52, 41.3], offset: [20, 0, 0] }

  # Callouts name the parts.
  - { type: label, views: [plan], at: [70, 20, 96.7], to: [84, -22, 96.7], text: deck compartment (hollow) }
  - { type: label, views: [plan], at: [2.6, 47, 96.7], to: [-30, -34, 96.7], text: thumb scoop (approx.) }
  - { type: label, views: [plan], at: [-65, 49.55, 33.7], to: [-70, 105, 33.7], text: thumb scoops, hide: true }
  - { type: label, views: [plan], at: [60, 60, 5.3], to: [118, 124, 5.3], text: tray cubby under (hidden) }
  - { type: label, views: [plan], at: [20, 99, 96.7], to: [-12, 126, 96.7], text: card case (approx.) }
  - { type: label, views: [section], at: [2.6, 52, 60], to: [-45, 52, 90], text: "wall, scoop cut (approx.)" }
  - { type: label, views: [section], at: [40, 52, 23], to: [118, 52, 23], text: tray cubby }
  - { type: label, views: [section], at: [55, 52, 70], to: [118, 52, 70], text: hollow deck compartment }
  - { type: label, views: [section], at: [55, 52, 99], to: [118, 52, 108], text: lid (approx.) }
  - { type: label, views: [front], at: [0, 104, 99], to: [-30, 104, 112], text: lid (approx.) }
  - { type: label, views: [front], at: [0, 104, 70], to: [-30, 104, 78], text: slide-in card case (approx.) }
  - { type: label, views: [front], at: [40, 104, 23], to: [-30, 104, 30], text: tray cubby (hidden) }
  - { type: label, views: [iso], at: [0, 104, 192.6], to: [-40, 150, 215], text: "lid, lifted (approx.)" }
  - { type: label, views: [iso], at: [30, 104, 70], to: [60, 200, 60], text: card case (approx.) }
  - { type: label, views: [iso], at: [2.6, 47, 85], to: [-123, 73, 110], text: thumb scoop (approx.) }
```

The same source as a single isometric view, using `view="iso"` on the fence:

```schematic alt="Isometric view of a Sidekick Pro XL deck box with its lid lifted off and its token tray beside it" view="iso"
# Gamegenic Sidekick Pro XL, a Magic: The Gathering Commander deck box.
#
# SOURCES AND HONESTY
# - The three OUTER dimensions, 110 x 104 x 102 mm (W x D x H), come from
#   retailer listings and are unverified. The manufacturer does not publish
#   dimensions. One retailer lists 85 x 100 x 102 mm, so the width is disputed.
# - MEASURED by the owner of the box (approximate, not a manufacturer spec),
#   and so dimensioned on the drawing:
#     the token tray's outer size, about 80 x 85.7 x 33.7 mm (W x D x H);
#     the tray cubby (the slot the tray slides into), 88.5 x 36 x 80 mm
#     (opening width x opening height x depth into the box);
#     the "material width", 5.3 mm, used for the tray's walls;
#     the tray's thumb scoops, one on each of two opposite sides, starting
#     about 29.5 mm from each end of the wall with about 19 mm of wall left
#     under them (so 26.7 mm wide and 14.7 mm deep, assuming they are in the
#     85.7 mm walls).
#   The tray's inside width and depth are the outer size less two walls; its
#   inside height also takes off a floor ASSUMED to be 5.3 mm.
# - ASSUMED from that 5.3 mm material: the body's walls, the slab under the
#   cubby, the compartment floor above it and the lid are all drawn 5.3 mm
#   thick. Nobody measured those.
# - GUESSED, estimated from a product photo, with no dimension lines: where the
#   cubby sits in the box (opening on the left face, 5.3 mm up from the base
#   and in from the back), the tray's floor thickness, the 36 mm round thumb
#   scoop in the compartment's left wall, the U shape of the tray's scoops, the 10 mm card case and the lift
#   of the lid in the exploded view.
# - KNOWN WRONG: the real cover is a flap hinged at the bottom front, not a
#   lift-off lid, and the card case is a slide-in window, not a solid slab.
#   With a 36 mm cubby under it, the compartment drawn here is about 50 mm
#   deep, which is less than a sleeved card is wide, so the retailer height of
#   102 mm probably does not match the measured parts.
# - Features per the manufacturer: a removable cover that clips onto the
#   bottom, a front slide-in card case (UV protective, shows the commander
#   card), an integrated drawer for tokens and dice, magnets closing the lid,
#   capacity 100 double-sleeved cards.
#
# The plan shows the box with the lid off and the tray pulled out to the left;
# the front elevation is closed up, with the cubby as hidden (dash-dot) lines;
# the section cuts through the middle (the card case is on the removed near
# half) and shows the empty cubby and compartment; the isometric view lifts
# the lid clear so the inside shows.
#
# Axes: x is width (left to right), y is depth (the front, with the slide-in
# card case, faces +y), z is height.
units: mm
scale: 2.2
views: [plan, front, section, iso]
columns: 1
cut: 52
shapes:
  # The drawer tier under the compartment, which holds the tray cubby. Outside
  # views see a plain block (the opening is on the far, left face)...
  - { type: box, id: tier, views: [plan, front, iso], at: [0, 0, 0], size: [110, 104, 41.3], style: blue }
  # ...and the section sees what is left once the cubby (x 0 to 80, 36 high) is
  # taken out: the slab under it and the block beside it.
  - { type: box, id: tier-base, views: [section], at: [0, 0, 0], size: [110, 104, 5.3], style: blue }
  - { type: box, id: tier-side, views: [section], at: [80, 0, 5.3], size: [30, 104, 36], style: blue }
  # The cubby as hidden lines where a solid covers it.
  - { type: line, views: [plan], dashed: true, closed: true, points: [[0, 5.3, 5.3], [80, 5.3, 5.3], [80, 93.8, 5.3], [0, 93.8, 5.3]] }
  - { type: line, views: [front], dashed: true, closed: true, points: [[0, 104, 5.3], [80, 104, 5.3], [80, 104, 41.3], [0, 104, 41.3]] }

  # The deck compartment, a hollow open-top shell standing on the tier, with a
  # thumb scoop in its left wall (estimated from a photo).
  - { type: box, id: body, at: [0, 0, 41.3], size: [110, 94, 55.4], wall: 5.3, style: blue,
      scoops: [{ side: -x, at: 47, width: 36, shape: round }] }
  # The token tray, a separate open-top tray shown pulled out of its cubby to
  # the left, with a thumb scoop on both sides. Outer size, wall and scoop size
  # measured; floor and the scoops' U shape estimated.
  - type: box
    id: tray
    label: tray
    views: [plan, section, iso]
    at: [-145, 6.7, 0]
    size: [80, 85.7, 33.7]
    wall: 5.3
    style: yellow
    scoops:
      # 29.5 mm in from each end of the 85.7 mm wall, 19 mm of wall left under it
      - { side: +x, at: 42.85, width: 26.7, depth: 14.7, shape: u }
      - { side: -x, at: 42.85, width: 26.7, depth: 14.7, shape: u }
  # Approximate: the front slide-in card case, a thin slab on the front face.
  - { type: box, id: card-case, at: [0, 94, 41.3], size: [110, 10, 55.4], style: green }
  # Approximate: the lid. Closed in the elevations...
  - { type: box, id: lid, views: [front, section], at: [0, 0, 96.7], size: [110, 104, 5.3], style: orange }
  # ...and lifted off in the isometric view, with guide lines to where it seats.
  - { type: box, id: lid-lifted, views: [iso], at: [0, 0, 190], size: [110, 104, 5.3], style: orange }
  - { type: line, views: [iso], dashed: true, points: [[0, 104, 96.7], [0, 104, 190]] }
  - { type: line, views: [iso], dashed: true, points: [[110, 104, 96.7], [110, 104, 190]] }
  - { type: line, views: [iso], dashed: true, points: [[110, 0, 96.7], [110, 0, 190]] }

  # The box's outer width and depth, and the closed height (retailer listings).
  - { type: dim, views: [plan, iso], from: [0, 104, 0], to: [110, 104, 0], offset: [0, 24, 0] }
  - { type: dim, views: [plan, iso], from: [110, 0, 0], to: [110, 104, 0], offset: [24, 0, 0] }
  - { type: dim, views: [front], from: [0, 104, 0], to: [110, 104, 0], offset: [0, 0, -24] }
  - { type: dim, views: [front], from: [110, 104, 0], to: [110, 104, 102], offset: [24, 0, 0] }

  # The tray's three outer measurements (measured).
  - { type: dim, views: [plan, iso], from: [-145, 92.4, 0], to: [-65, 92.4, 0], offset: [0, 24, 0] }
  - { type: dim, views: [plan], from: [-145, 6.7, 0], to: [-145, 92.4, 0], offset: [-24, 0, 0] }
  - { type: dim, views: [iso], from: [-145, 92.4, 0], to: [-145, 92.4, 33.7], offset: [-24, 0, 0] }
  - { type: dim, views: [section], from: [-145, 52, 0], to: [-145, 52, 33.7], offset: [-20, 0, 0] }

  # The tray's inside: the outer size less the 5.3 mm walls (69.4 x 75.1), and
  # its depth above a floor ASSUMED to be 5.3 mm too (28.4).
  - { type: dim, views: [plan], from: [-139.7, 12, 0], to: [-70.3, 12, 0], offset: [0, -22, 0] }
  - { type: dim, views: [plan], from: [-139.7, 12, 0], to: [-139.7, 87.1, 0], offset: [12, 0, 0] }
  - { type: dim, views: [section], from: [-125, 52, 5.3], to: [-125, 52, 33.7] }
  # The tray's thumb scoops (measured): 29.5 mm in from each end of the wall,
  # so 26.7 mm wide, with 19 mm of wall left under them, so 14.7 mm deep.
  # Recorded but hidden, to keep the drawing clear; the scoops are still drawn.
  - { type: dim, views: [plan], from: [-65, 6.7, 0], to: [-65, 36.2, 0], offset: [14, 0, 0], hide: true }
  - { type: dim, views: [plan], from: [-65, 36.2, 0], to: [-65, 62.9, 0], offset: [32, 0, 0], hide: true }
  - { type: dim, views: [section], from: [-65, 52, 0], to: [-65, 52, 19], offset: [14, 0, 0], hide: true }
  - { type: dim, views: [section], from: [-65, 52, 19], to: [-65, 52, 33.7], offset: [30, 0, 0], hide: true }

  # The cubby's three measurements (measured).
  - { type: dim, views: [plan], from: [0, 5.3, 5.3], to: [0, 93.8, 5.3], offset: [24, 0, 0] }
  - { type: dim, views: [section], from: [0, 52, 0], to: [80, 52, 0], offset: [0, 0, -22] }
  - { type: dim, views: [section], from: [0, 52, 5.3], to: [0, 52, 41.3], offset: [20, 0, 0] }

  # Callouts name the parts.
  - { type: label, views: [plan], at: [70, 20, 96.7], to: [84, -22, 96.7], text: deck compartment (hollow) }
  - { type: label, views: [plan], at: [2.6, 47, 96.7], to: [-30, -34, 96.7], text: thumb scoop (approx.) }
  - { type: label, views: [plan], at: [-65, 49.55, 33.7], to: [-70, 105, 33.7], text: thumb scoops, hide: true }
  - { type: label, views: [plan], at: [60, 60, 5.3], to: [118, 124, 5.3], text: tray cubby under (hidden) }
  - { type: label, views: [plan], at: [20, 99, 96.7], to: [-12, 126, 96.7], text: card case (approx.) }
  - { type: label, views: [section], at: [2.6, 52, 60], to: [-45, 52, 90], text: "wall, scoop cut (approx.)" }
  - { type: label, views: [section], at: [40, 52, 23], to: [118, 52, 23], text: tray cubby }
  - { type: label, views: [section], at: [55, 52, 70], to: [118, 52, 70], text: hollow deck compartment }
  - { type: label, views: [section], at: [55, 52, 99], to: [118, 52, 108], text: lid (approx.) }
  - { type: label, views: [front], at: [0, 104, 99], to: [-30, 104, 112], text: lid (approx.) }
  - { type: label, views: [front], at: [0, 104, 70], to: [-30, 104, 78], text: slide-in card case (approx.) }
  - { type: label, views: [front], at: [40, 104, 23], to: [-30, 104, 30], text: tray cubby (hidden) }
  - { type: label, views: [iso], at: [0, 104, 192.6], to: [-40, 150, 215], text: "lid, lifted (approx.)" }
  - { type: label, views: [iso], at: [30, 104, 70], to: [60, 200, 60], text: card case (approx.) }
  - { type: label, views: [iso], at: [2.6, 47, 85], to: [-123, 73, 110], text: thumb scoop (approx.) }
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
