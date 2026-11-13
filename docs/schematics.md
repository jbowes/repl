# Schematics

A fenced block tagged `schematic` draws plan, elevation and isometric views of
physical objects from one small YAML description, in the same technical
line-art style, panel and palette as diagrams (`src/schematic/`, no new
dependencies). `alt` becomes the SVG `<title>`; a `<desc>` listing the named
parts and dimensions is generated. Fence options: `alt="..."`,
`view="iso"` (or `view="plan,front,iso"`) to override the views in the source,
and `src="file.yaml"` to read the source from a file instead of the block.

````
```schematic alt="A crate with its width dimensioned"
units: mm
scale: 2
views: [plan, iso]
shapes:
  - { type: box, id: crate, at: [0, 0, 0], size: [120, 80, 60], style: blue }
  - { type: dim, from: [0, 80, 0], to: [120, 80, 0], offset: [0, 20, 0] }
```
````

Every shape sits in 3D coordinates `[x, y, z]` (`z` optional, default 0): x is
left to right, y runs down the page in plan (toward the viewer), z is up. Sizes
are `[w, d, h]` (x, y, z extents) in real units. Top level fields:

- `units`: a label for dimension text, default `mm`. Nothing is converted.
- `scale`: pixels per unit. Default fits the largest dimension to about 240px.
- `view: plan|front|side|section|iso`, or `views: [plan, front, iso]` for several views
  of the same model, each in a framed cell with a caption. `columns: N` wraps
  them into a grid (default one row).
- `grid`: the isometric grid an `iso` view is drawn on: `true` (the default),
  `false` for none, or its spacing in units. By default the spacing is the
  first round number (1, 2 or 5 times a power of ten) that puts the lines about
  16 px apart, such as 10 mm at a scale of 2.2. The grid is iso graph paper:
  lines along the floor's two axes, at 30 and 150 degrees, and verticals
  through their crossings. It is aligned to the model's origin, so a box at a
  multiple of the spacing sits on its lines. When every view is `iso` it fills
  the whole drawing and replaces the panel's square grid; with other views it
  fills the iso view's frame and they keep the square one.
- `shapes`: the list of primitives below.

Views: `plan` is top-down (x right, y down, z ignored); `front` looks from +y
(x right, z up) and `side` from +x (y right, z up), so they drop an axis;
`section` is `front` with the model cut at the plane `y = cut` (top level
`cut:`, default the middle of the model's y extent) and the near half removed,
so cut material is hatched and a hollow stays empty; `iso`
is 30-degree isometric, `sx = (x - y) cos30`, `sy = (x + y) sin30 - z`, viewed
from +x, +y, +z, so the +y face is the left face and the +x face the right.

Every primitive takes `type`, an optional `id`, `label`, `style`, `views`
(a list, to show it in some views only: dimension lines usually differ per
view) and `hide` (`hide: true` keeps it in the source and in the generated
description, but does not draw it: for measurements worth recording that
would crowd the drawing). `style` is `blue`, `red`, `green`, `orange` or `yellow` with an optional
`-solid` or `-cross` suffix, as in diagrams (default: uncoloured, no fill; a
colour alone is hachure).

| `type` | fields | notes |
| --- | --- | --- |
| `box` | `at`, `size: [w, d, h]`, `hidden`, `wall`, `floor`, `scoops`, `slots` | Axis-aligned cuboid. Iso draws top, left and right faces, shaded top lightest to right darkest; `hidden: true` adds the three back edges as faint dash-dot. `label` is written on it. `wall: t` makes it a hollow, open-top shell with walls `t` thick and a floor `floor` thick (default `t`): plan hatches the rim around an empty cavity, the section view hatches only the cut walls and floor, the front and side elevations show the cavity as dash-dot hidden lines, and iso shows the inside through the opening. `scoops` notch its walls and `slots` tunnel into its floor (below). |
| `cylinder` | `at` (centre of the base), `r`, `h` | Vertical. A circle in plan, a rectangle with a centre line in elevations, an ellipse-topped can in iso. |
| `rect` (or `plane`) | `at`, `size: [w, d]`, `dashed` | A flat horizontal outline at height `at[2]`: a footprint, a cutout. A line in elevations. |
| `line` (or `wire`) | `points: [[x, y, z], ...]`, `dashed`, `closed` | A 3D polyline; `dashed` is dash-dot, for hidden lines. |
| `dim` | `from`, `to`, `offset`, `text` | A dimension line with extension lines, arrowheads and text. `offset` is the 3D vector from the measured points to the dimension line. The text is the true 3D distance plus the units unless `text` is given; it runs along the line. A dimension that has no length in a view (along the line of sight) is skipped there. |
| `label` | `at`, `text`, `to` | Text with a leader line ending in a dot at `at`. `to` is where the text sits (a 3D point; default up and to the right). |
| `group` | `at`, `shapes` | Translates its children by `at`; children inherit the group's `style`. |

Scoops: a hollow box takes `scoops: [{ side, at, width, depth, shape }]`, each a
notch cut down from the rim of one wall through its full thickness (a thumb
scoop, a tray's pour notch).

- `side`: `+x`, `-x`, `+y` or `-y`, the wall the scoop is in.
- `at`: where along that wall its centre is, measured from the wall's start
  (x min for the `+y`/`-y` walls, y min for `+x`/`-x`). The scoop must fit
  inside the wall, clear of the corners (`wall <= at - width/2` and
  `at + width/2 <= length - wall`).
- `width`, `depth`: size of the notch; the depth is measured down from the rim
  and must not exceed the wall's height above the floor.
- `shape`: `u` (default; straight sides, round bottom, `depth` required) or
  `round` (a semicircle, so `depth` is `width/2` and is omitted).

Plan breaks the hatched rim at the scoop and draws the lowered wall under it
darker and unhatched; the elevation facing the wall (`front` for `+y`, `side`
for `+x`) shows the notch in the wall's outline; a section whose cut passes
through a scoop in the `-x`/`+x` wall lowers that wall's hatched cut and shows
the rest of the wall, past the cut, darker above it; iso shows the
notch in the outer or inner face, the cut surface through the wall, and the
gap in the rim. Scoops need `wall` (a solid box rejects them).

Slots: a hollow box takes `slots: [{ side, at, width, height, depth, bottom }]`,
each a rectangular tunnel into its solid floor from one side face, such as the
cubby a drawer slides into.

- `side`: the face it opens on, `+x`, `-x`, `+y` or `-y`.
- `at`, `width`: the centre of the opening along that face (measured as for
  scoops) and its width.
- `bottom`, `height`: how far above the box's base the opening starts (default
  0) and how tall it is. The slot must stay inside the floor, so
  `bottom + height` cannot exceed `floor`.
- `depth`: how far it runs into the box.

A section whose cut passes through a slot leaves it empty, as a notch in from
the side it opens on (or a hole, where the cut crosses the tunnel end on). The
elevation facing the slot shows its opening; other elevations and the plan show
it as dash-dot hidden lines. Iso sees through the box to the slot: the tunnel's
edges behind a solid face are faint dash-dot, and when it opens on a face toward
the viewer (`+x` or `+y`) the opening is drawn with the tunnel's floor, far side
and back seen through it. A slot on a face turned away is drawn as hidden lines
only.

Errors fail the build with the field path, e.g.
`schematic: shapes[2].size: expected [w, d, h] of positive numbers, got [1,2]`;
unknown fields are errors too, so typos do not pass silently.

Limits: boxes and cylinders are ordered back to front by separating planes,
which is exact for axis-aligned solids that do not intersect (touching is
fine); intersecting solids are drawn in source order. Lines, dimensions and
labels are drawn over all solids and are never hidden by them. There are no
rotated shapes, no cylinders on their side, no vertical `rect` (a window in a
wall) and no curved dimensions. Scoops are notches from the rim only (no notches
or holes in the middle of a wall) and are not seen in an elevation through the
opposite wall's notch. Hatch lines are screen-space 45 degrees in
every view.

A long source can live in its own file. Leave the block empty and give
`src="path"`, relative to the post and inside its directory (for example
`src="schematics/box.schematic.yaml"` for a post in `content/`). It is an error
to give both a body and `src`, or a path that is missing or outside the post's
directory. Edits to the file need a restart of the dev server to show.

Output is deterministic. Preview one with
`node scripts/render-schematic.js in.yaml out.svg --view iso`; examples live in
[`test/fixtures/*.schematic.yaml`](../test/fixtures/).
