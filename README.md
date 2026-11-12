# This is a website.

There are many like it, but this one is mine.

- static AOT rendering with react
- no SPA or data elements on the client. it's just plain html there.

## Diagrams

A fenced block tagged `diagram` in `content/*.md` is drawn at build time as an
inline, hand-drawn-looking SVG ([rough.js](https://roughjs.com), laid out with
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

Output is deterministic: rough.js is seeded from a hash of the source. Preview
one with `node scripts/render-diagram.js in.diagram out.svg`; examples live in
`test/fixtures/`.
