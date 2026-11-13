# This is a website.

There are many like it, but this one is mine.

- static AOT rendering with react
- no SPA or data elements on the client. it's just plain html there.

## Diagrams

A fenced block tagged `diagram` in `content/*.md` is drawn at build time as an
inline SVG (technical line art, or hand-drawn with [rough.js](https://roughjs.com); laid out with
[dagre](https://github.com/dagrejs/dagre)). The source is a small subset of
Mermaid syntax. `alt` becomes the SVG `<title>`; a step-by-step `<desc>` is
generated from the diagram.

````
```diagram alt="Provider posts a webhook and the receiver acknowledges it"
sequenceDiagram
  participant P as Provider
  participant R as Receiver
  P->>R: POST /webhook
  R-->>P: 200 OK
```
````

- `sequenceDiagram`: `participant ID as Label` (optional), `A->>B: text`
  (solid) and `A-->>B: text` (dashed). `A->>A` draws a self-message.
- `flowchart LR|RL|TB|BT`: `A[box]`, `B(round)`, `C{decision}`, then
  `-->`, `-.->` (dashed) and `---` (no arrowhead), with an optional
  `-->|label|`. Edges can be chained: `A --> B --> C`.
- `%%` starts a comment line.
- Colour: add `:::colour` to a node or participant, e.g. `A[Client]:::blue` or
  `participant P as Provider:::green`. Colours are `blue`, `red`, `green`,
  `orange` and `yellow`, the code-highlighting palette. A `-solid` or `-cross`
  suffix changes the fill from hachure (`:::red-solid`, `:::orange-cross`).

Diagrams are centred in the same panel as code blocks (`--code-bg`) on a faint
grid, with edges in the operator blue and uncoloured nodes in the code
foreground. The default style is technical line art: chamfered panels with an
inset panel line and crop marks, hatch fills, dash-dot lines for dashed edges,
solid arrowheads, monospace labels and index tags. Add `style="sketch"` to the
fence for the hand-drawn rough.js look (`--style sketch` in the CLI).

Output is deterministic: rough.js is seeded from a hash of the source. Preview
one with `node scripts/render-diagram.js in.diagram out.svg`; examples live in
`test/fixtures/`.

## Schematics

A fenced block tagged `schematic` draws plan, elevation, section and isometric
views of a physical object from one small YAML description, in the same
technical line-art style as diagrams. See [docs/schematics.md](docs/schematics.md)
for the format and its limits.
