---
title: "Schematic Test"
date: 2026-11-12T12:00:00-04:00
summary: |
  A demo of plan, elevation and isometric schematics.
description: |
  A demo of plan, elevation and isometric schematics drawn from YAML at build time.
---

A Gamegenic Sidekick Pro XL, the Commander-sized deck box, drawn from one
YAML source: a plan with the token tray pulled out, a front elevation, a
section cut through the middle, and an isometric view that shows the empty
compartment through the open top and the cubby opening in the side. The cover and the slide-in card case are
left off, and the whole footprint is drawn as one plain deck box.

What is measured and what is not:

- Measured by the box's owner (approximate, not a manufacturer spec): the
  base, 94.5 x 113 mm, with about 12.5 mm on each side of the cubby opening
  (drawn as 12.25 mm, since 12.5 + 88.5 + 12.5 is half a millimetre over); the
  cubby the tray slides into, 88.5 x 36 x 80 mm; the token tray's outer size,
  about 80 x 85.7 x 33.7 mm; the material thickness, 5.3 mm; and the tray's
  thumb scoops, about 26.7 mm wide and 14.7 mm deep, one on each of two
  opposite sides. These carry the dimension lines, except the scoop
  measurements, which are recorded in the source with `hide: true`, so they
  are in the description but not drawn. The tray's inside width and depth are
  its outer size less two walls; its inside height also takes off a floor
  assumed to be 5.3 mm.
- Unverified: the closed height, 102 mm, is from retailer listings, which
  give 110 x 104 x 102 mm. The measured base matches neither of those
  footprint figures, so the height may be off too. The manufacturer does not
  publish dimensions.
- The walls, base and compartment floor are all assumed to be the same
  5.3 mm material. How high the cubby sits, the tray's floor, the U shape of
  its scoops and the size of the thumb scoops in the top of the compartment
  (there is one on both sides) are guesses from a product photo.
- Not drawn: the cover, a flap hinged at the bottom front, and the slide-in
  card case on the front. The box is drawn up to the full 102 mm, as if that
  height did not include the cover.
- Does not add up: with a 36 mm cubby under it the compartment drawn here is
  too shallow for a sleeved card, so the 102 mm height probably does not
  match the measured parts.

```schematic alt="Plan, front, section and isometric views of a Sidekick Pro XL deck box, 94.5 by 113 millimetres at the base, with its token tray pulled out of the cubby under the deck compartment"
# Gamegenic Sidekick Pro XL, a Magic: The Gathering Commander deck box.
#
# SOURCES AND HONESTY
# - MEASURED by the owner of the box (approximate, not a manufacturer spec),
#   and dimensioned on the drawing unless noted:
#     the box's base, 94.5 x 113 mm, with about 12.5 mm of base on each side of
#     the cubby opening (so the opening is in a 113 mm face; drawn as 12.25);
#     the tray cubby (the slot the tray slides into), 88.5 x 36 x 80 mm
#     (opening width x opening height x depth into the box);
#     the token tray's outer size, about 80 x 85.7 x 33.7 mm (W x D x H);
#     the "material width", 5.3 mm, used for the tray's walls;
#     the tray's thumb scoops, one on each of two opposite sides, starting
#     about 29.5 mm from each end of the wall with about 19 mm of wall left
#     under them (so 26.7 mm wide and 14.7 mm deep, assuming they are in the
#     85.7 mm walls). These are recorded with `hide: true` and not drawn.
#   The tray's inside width and depth are the outer size less two walls; its
#   inside height also takes off a floor ASSUMED to be 5.3 mm.
# - UNVERIFIED: the closed height, 102 mm, is from retailer listings, which
#   give 110 x 104 x 102 mm (one gives 85 x 100 x 102). The measured base does
#   not match either footprint, so the height may be off too. The manufacturer
#   does not publish dimensions.
# - ASSUMED from the 5.3 mm material: the body's walls, the slab under the
#   cubby and the compartment floor above it are all drawn 5.3 mm thick.
#   Nobody measured those.
# - GUESSED, estimated from a product photo, with no dimension lines: how high
#   the cubby sits (5.3 mm up from the base), the tray's floor thickness, the
#   size and round shape of the thumb scoops in the top of the compartment
#   (36 mm; the owner confirmed there is one on both sides) and the U shape of
#   the tray's scoops.
# - NOT DRAWN: the cover, a flap hinged at the bottom front, and the slide-in
#   card case on the front. The whole footprint is treated as one plain deck
#   box, drawn up to the full 102 mm as if the height did not include the cover.
# - DOES NOT ADD UP: with a 36 mm cubby under it, the compartment drawn here is about 55 mm
#   deep, which is less than a sleeved card is wide, so the 102 mm height
#   probably does not match the measured parts.
# - Features per the manufacturer: a removable cover that clips onto the
#   bottom, a front slide-in card case (UV protective, shows the commander
#   card), an integrated drawer for tokens and dice, magnets closing the lid,
#   capacity 100 double-sleeved cards.
#
# The plan shows the box and the tray pulled out to the right; the front
# elevation shows the cubby and compartment as hidden (dash-dot) lines; the
# section cuts through the middle and shows them empty; the isometric view
# shows the inside through the open top and the cubby opening on the right.
#
# Axes: x is the 94.5 mm side (left to right), y is the 113 mm side (the
# front faces +y), z is height. The box is turned so the cubby opens on the
# right, +x, face, which the isometric view can see.
units: mm
scale: 2.2
views: [plan, front, section, iso]
columns: 1
cut: 56.5
shapes:
  # The deck box: one hollow open-top shell. Its floor is 46.6 mm thick, which
  # is the 5.3 mm slab under the cubby, the 36 mm cubby and the 5.3 mm
  # compartment floor above it. The cubby is a slot into that floor from the
  # right face, centred in the 113 mm side. Thumb scoops in the top of both
  # side walls (size estimated from a photo).
  - type: box
    id: body
    at: [0, 0, 0]
    size: [94.5, 113, 102]
    wall: 5.3
    floor: 46.6
    style: blue
    scoops:
      - { side: -x, at: 56.5, width: 36, shape: round }
      - { side: +x, at: 56.5, width: 36, shape: round }
    slots:
      - { side: +x, at: 56.5, width: 88.5, height: 36, depth: 80, bottom: 5.3 }
  # The token tray, a separate open-top tray shown pulled out of its cubby to
  # the right, with a thumb scoop on both sides. Outer size, wall and scoop size
  # measured; floor and the scoops' U shape estimated.
  - type: box
    id: tray
    label: tray
    views: [plan, section, iso]
    at: [159.5, 13.65, 0]
    size: [80, 85.7, 33.7]
    wall: 5.3
    style: yellow
    scoops:
      # 29.5 mm in from each end of the 85.7 mm wall, 19 mm of wall left under it
      - { side: +x, at: 42.85, width: 26.7, depth: 14.7, shape: u }
      - { side: -x, at: 42.85, width: 26.7, depth: 14.7, shape: u }

  # The box's base (measured) and its height (retailer listings).
  - { type: dim, views: [plan, iso], from: [0, 113, 0], to: [94.5, 113, 0], offset: [0, 24, 0] }
  - { type: dim, views: [plan], from: [0, 0, 0], to: [0, 113, 0], offset: [-24, 0, 0] }
  - { type: dim, views: [front], from: [0, 113, 0], to: [94.5, 113, 0], offset: [0, 0, -24] }
  - { type: dim, views: [front], from: [0, 113, 0], to: [0, 113, 102], offset: [-24, 0, 0] }

  # The tray's three outer measurements (measured).
  - { type: dim, views: [plan, iso], from: [159.5, 99.35, 0], to: [239.5, 99.35, 0], offset: [0, 24, 0] }
  - { type: dim, views: [plan], from: [239.5, 13.65, 0], to: [239.5, 99.35, 0], offset: [24, 0, 0] }
  - { type: dim, views: [iso], from: [239.5, 13.65, 0], to: [239.5, 13.65, 33.7], offset: [24, 0, 0] }
  - { type: dim, views: [section], from: [239.5, 56.5, 0], to: [239.5, 56.5, 33.7], offset: [20, 0, 0] }

  # The tray's inside: the outer size less the 5.3 mm walls (69.4 x 75.1), and
  # its depth above a floor ASSUMED to be 5.3 mm too (28.4).
  - { type: dim, views: [plan], from: [164.8, 18.95, 0], to: [234.2, 18.95, 0], offset: [0, -22, 0] }
  - { type: dim, views: [plan], from: [234.2, 18.95, 0], to: [234.2, 94.05, 0], offset: [-12, 0, 0] }
  - { type: dim, views: [section], from: [219.5, 56.5, 5.3], to: [219.5, 56.5, 33.7] }
  # The tray's thumb scoops (measured): 29.5 mm in from each end of the wall,
  # so 26.7 mm wide, with 19 mm of wall left under them, so 14.7 mm deep.
  # Recorded but hidden, to keep the drawing clear; the scoops are still drawn.
  - { type: dim, views: [plan], from: [159.5, 13.65, 0], to: [159.5, 43.15, 0], offset: [-14, 0, 0], hide: true }
  - { type: dim, views: [plan], from: [159.5, 43.15, 0], to: [159.5, 69.85, 0], offset: [-32, 0, 0], hide: true }
  - { type: dim, views: [section], from: [159.5, 56.5, 0], to: [159.5, 56.5, 19], offset: [-14, 0, 0], hide: true }
  - { type: dim, views: [section], from: [159.5, 56.5, 19], to: [159.5, 56.5, 33.7], offset: [-30, 0, 0], hide: true }

  # The cubby's three measurements, and the base left on each side of its
  # opening (measured). 12.5 + 88.5 + 12.5 is 113.5, half a millimetre over the
  # 113 mm base, so that half millimetre is taken off the two sides: the
  # opening is centred with 12.25 mm each side.
  - { type: dim, views: [plan], from: [94.5, 12.25, 5.3], to: [94.5, 100.75, 5.3], offset: [-24, 0, 0] }
  - { type: dim, views: [plan], from: [94.5, 0, 5.3], to: [94.5, 12.25, 5.3], offset: [16, 0, 0] }
  - { type: dim, views: [plan], from: [94.5, 100.75, 5.3], to: [94.5, 113, 5.3], offset: [16, 0, 0] }
  - { type: dim, views: [section], from: [14.5, 56.5, 0], to: [94.5, 56.5, 0], offset: [0, 0, -22] }
  - { type: dim, views: [section], from: [94.5, 56.5, 5.3], to: [94.5, 56.5, 41.3], offset: [-20, 0, 0] }

  # Callouts name the parts.
  - { type: label, views: [plan], at: [30, 30, 102], to: [10, -22, 102], text: deck compartment (hollow) }
  - { type: label, views: [plan], at: [2.6, 56.5, 102], to: [-8, -38, 102], text: thumb scoops (approx.), hide: true }
  - { type: label, views: [plan], at: [159.5, 56.5, 33.7], to: [154, 112, 33.7], text: thumb scoops, hide: true }
  - { type: label, views: [plan], at: [40, 75, 5.3], to: [60, -40, 5.3], text: tray cubby under (hidden) }
  - { type: label, views: [section], at: [2.6, 56.5, 70], to: [-40, 56.5, 95], text: "wall, scoop cut (approx.)" }
  - { type: label, views: [section], at: [50, 56.5, 23], to: [-12, 56.5, 23], text: tray cubby }
  - { type: label, views: [section], at: [47, 56.5, 70], to: [-12, 56.5, 60], text: hollow deck compartment }
  - { type: label, views: [front], at: [54.5, 113, 23], to: [124.5, 113, 30], text: tray cubby (hidden) }
  - { type: label, views: [iso], at: [94.5, 56.5, 23], to: [150, -40, 60], text: tray cubby }
  - { type: label, views: [iso], at: [2.6, 56.5, 90], to: [-90, 100, 130], text: thumb scoops (approx.) }
```

The same source as a single isometric view, using `view="iso"` on the fence:

```schematic alt="Isometric view of a Sidekick Pro XL deck box, open at the top, with the tray cubby open in its side and the token tray beside it" view="iso"
# Gamegenic Sidekick Pro XL, a Magic: The Gathering Commander deck box.
#
# SOURCES AND HONESTY
# - MEASURED by the owner of the box (approximate, not a manufacturer spec),
#   and dimensioned on the drawing unless noted:
#     the box's base, 94.5 x 113 mm, with about 12.5 mm of base on each side of
#     the cubby opening (so the opening is in a 113 mm face; drawn as 12.25);
#     the tray cubby (the slot the tray slides into), 88.5 x 36 x 80 mm
#     (opening width x opening height x depth into the box);
#     the token tray's outer size, about 80 x 85.7 x 33.7 mm (W x D x H);
#     the "material width", 5.3 mm, used for the tray's walls;
#     the tray's thumb scoops, one on each of two opposite sides, starting
#     about 29.5 mm from each end of the wall with about 19 mm of wall left
#     under them (so 26.7 mm wide and 14.7 mm deep, assuming they are in the
#     85.7 mm walls). These are recorded with `hide: true` and not drawn.
#   The tray's inside width and depth are the outer size less two walls; its
#   inside height also takes off a floor ASSUMED to be 5.3 mm.
# - UNVERIFIED: the closed height, 102 mm, is from retailer listings, which
#   give 110 x 104 x 102 mm (one gives 85 x 100 x 102). The measured base does
#   not match either footprint, so the height may be off too. The manufacturer
#   does not publish dimensions.
# - ASSUMED from the 5.3 mm material: the body's walls, the slab under the
#   cubby and the compartment floor above it are all drawn 5.3 mm thick.
#   Nobody measured those.
# - GUESSED, estimated from a product photo, with no dimension lines: how high
#   the cubby sits (5.3 mm up from the base), the tray's floor thickness, the
#   size and round shape of the thumb scoops in the top of the compartment
#   (36 mm; the owner confirmed there is one on both sides) and the U shape of
#   the tray's scoops.
# - NOT DRAWN: the cover, a flap hinged at the bottom front, and the slide-in
#   card case on the front. The whole footprint is treated as one plain deck
#   box, drawn up to the full 102 mm as if the height did not include the cover.
# - DOES NOT ADD UP: with a 36 mm cubby under it, the compartment drawn here is about 55 mm
#   deep, which is less than a sleeved card is wide, so the 102 mm height
#   probably does not match the measured parts.
# - Features per the manufacturer: a removable cover that clips onto the
#   bottom, a front slide-in card case (UV protective, shows the commander
#   card), an integrated drawer for tokens and dice, magnets closing the lid,
#   capacity 100 double-sleeved cards.
#
# The plan shows the box and the tray pulled out to the right; the front
# elevation shows the cubby and compartment as hidden (dash-dot) lines; the
# section cuts through the middle and shows them empty; the isometric view
# shows the inside through the open top and the cubby opening on the right.
#
# Axes: x is the 94.5 mm side (left to right), y is the 113 mm side (the
# front faces +y), z is height. The box is turned so the cubby opens on the
# right, +x, face, which the isometric view can see.
units: mm
scale: 2.2
views: [plan, front, section, iso]
columns: 1
cut: 56.5
shapes:
  # The deck box: one hollow open-top shell. Its floor is 46.6 mm thick, which
  # is the 5.3 mm slab under the cubby, the 36 mm cubby and the 5.3 mm
  # compartment floor above it. The cubby is a slot into that floor from the
  # right face, centred in the 113 mm side. Thumb scoops in the top of both
  # side walls (size estimated from a photo).
  - type: box
    id: body
    at: [0, 0, 0]
    size: [94.5, 113, 102]
    wall: 5.3
    floor: 46.6
    style: blue
    scoops:
      - { side: -x, at: 56.5, width: 36, shape: round }
      - { side: +x, at: 56.5, width: 36, shape: round }
    slots:
      - { side: +x, at: 56.5, width: 88.5, height: 36, depth: 80, bottom: 5.3 }
  # The token tray, a separate open-top tray shown pulled out of its cubby to
  # the right, with a thumb scoop on both sides. Outer size, wall and scoop size
  # measured; floor and the scoops' U shape estimated.
  - type: box
    id: tray
    label: tray
    views: [plan, section, iso]
    at: [159.5, 13.65, 0]
    size: [80, 85.7, 33.7]
    wall: 5.3
    style: yellow
    scoops:
      # 29.5 mm in from each end of the 85.7 mm wall, 19 mm of wall left under it
      - { side: +x, at: 42.85, width: 26.7, depth: 14.7, shape: u }
      - { side: -x, at: 42.85, width: 26.7, depth: 14.7, shape: u }

  # The box's base (measured) and its height (retailer listings).
  - { type: dim, views: [plan, iso], from: [0, 113, 0], to: [94.5, 113, 0], offset: [0, 24, 0] }
  - { type: dim, views: [plan], from: [0, 0, 0], to: [0, 113, 0], offset: [-24, 0, 0] }
  - { type: dim, views: [front], from: [0, 113, 0], to: [94.5, 113, 0], offset: [0, 0, -24] }
  - { type: dim, views: [front], from: [0, 113, 0], to: [0, 113, 102], offset: [-24, 0, 0] }

  # The tray's three outer measurements (measured).
  - { type: dim, views: [plan, iso], from: [159.5, 99.35, 0], to: [239.5, 99.35, 0], offset: [0, 24, 0] }
  - { type: dim, views: [plan], from: [239.5, 13.65, 0], to: [239.5, 99.35, 0], offset: [24, 0, 0] }
  - { type: dim, views: [iso], from: [239.5, 13.65, 0], to: [239.5, 13.65, 33.7], offset: [24, 0, 0] }
  - { type: dim, views: [section], from: [239.5, 56.5, 0], to: [239.5, 56.5, 33.7], offset: [20, 0, 0] }

  # The tray's inside: the outer size less the 5.3 mm walls (69.4 x 75.1), and
  # its depth above a floor ASSUMED to be 5.3 mm too (28.4).
  - { type: dim, views: [plan], from: [164.8, 18.95, 0], to: [234.2, 18.95, 0], offset: [0, -22, 0] }
  - { type: dim, views: [plan], from: [234.2, 18.95, 0], to: [234.2, 94.05, 0], offset: [-12, 0, 0] }
  - { type: dim, views: [section], from: [219.5, 56.5, 5.3], to: [219.5, 56.5, 33.7] }
  # The tray's thumb scoops (measured): 29.5 mm in from each end of the wall,
  # so 26.7 mm wide, with 19 mm of wall left under them, so 14.7 mm deep.
  # Recorded but hidden, to keep the drawing clear; the scoops are still drawn.
  - { type: dim, views: [plan], from: [159.5, 13.65, 0], to: [159.5, 43.15, 0], offset: [-14, 0, 0], hide: true }
  - { type: dim, views: [plan], from: [159.5, 43.15, 0], to: [159.5, 69.85, 0], offset: [-32, 0, 0], hide: true }
  - { type: dim, views: [section], from: [159.5, 56.5, 0], to: [159.5, 56.5, 19], offset: [-14, 0, 0], hide: true }
  - { type: dim, views: [section], from: [159.5, 56.5, 19], to: [159.5, 56.5, 33.7], offset: [-30, 0, 0], hide: true }

  # The cubby's three measurements, and the base left on each side of its
  # opening (measured). 12.5 + 88.5 + 12.5 is 113.5, half a millimetre over the
  # 113 mm base, so that half millimetre is taken off the two sides: the
  # opening is centred with 12.25 mm each side.
  - { type: dim, views: [plan], from: [94.5, 12.25, 5.3], to: [94.5, 100.75, 5.3], offset: [-24, 0, 0] }
  - { type: dim, views: [plan], from: [94.5, 0, 5.3], to: [94.5, 12.25, 5.3], offset: [16, 0, 0] }
  - { type: dim, views: [plan], from: [94.5, 100.75, 5.3], to: [94.5, 113, 5.3], offset: [16, 0, 0] }
  - { type: dim, views: [section], from: [14.5, 56.5, 0], to: [94.5, 56.5, 0], offset: [0, 0, -22] }
  - { type: dim, views: [section], from: [94.5, 56.5, 5.3], to: [94.5, 56.5, 41.3], offset: [-20, 0, 0] }

  # Callouts name the parts.
  - { type: label, views: [plan], at: [30, 30, 102], to: [10, -22, 102], text: deck compartment (hollow) }
  - { type: label, views: [plan], at: [2.6, 56.5, 102], to: [-8, -38, 102], text: thumb scoops (approx.), hide: true }
  - { type: label, views: [plan], at: [159.5, 56.5, 33.7], to: [154, 112, 33.7], text: thumb scoops, hide: true }
  - { type: label, views: [plan], at: [40, 75, 5.3], to: [60, -40, 5.3], text: tray cubby under (hidden) }
  - { type: label, views: [section], at: [2.6, 56.5, 70], to: [-40, 56.5, 95], text: "wall, scoop cut (approx.)" }
  - { type: label, views: [section], at: [50, 56.5, 23], to: [-12, 56.5, 23], text: tray cubby }
  - { type: label, views: [section], at: [47, 56.5, 70], to: [-12, 56.5, 60], text: hollow deck compartment }
  - { type: label, views: [front], at: [54.5, 113, 23], to: [124.5, 113, 30], text: tray cubby (hidden) }
  - { type: label, views: [iso], at: [94.5, 56.5, 23], to: [150, -40, 60], text: tray cubby }
  - { type: label, views: [iso], at: [2.6, 56.5, 90], to: [-90, 100, 130], text: thumb scoops (approx.) }
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
