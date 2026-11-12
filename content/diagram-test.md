---
title: "Diagram test page"
date: 2026-11-12T12:00:00-04:00
summary: |
  Demo of hand-drawn rough.js diagrams built from Mermaid-style text. Remove before merging.
description: |
  Demo of hand-drawn rough.js diagrams built from Mermaid-style text.
---

Diagrams are drawn as technical line art in the code block panel and palette. A sequence diagram, with coloured participants, index tags, dash-dot lines for replies and solid arrowheads:

```diagram alt="A provider sends a signed webhook and the receiver verifies it before replying 200"
sequenceDiagram
  participant P as Provider:::blue
  participant R as Receiver:::green
  P->>R: POST /webhook (signed)
  R->>R: verify signature
  R-->>P: 200 OK
```

A flowchart where each node takes a palette colour and a fill style. The default fill is hachure, `-solid` tints the whole shape, and `-cross` cross-hatches:

```diagram alt="Idempotency key flow: replay the stored response if the key was seen, otherwise process and store it"
flowchart LR
  A[Client]:::blue --> B(API):::green-solid
  B --> C{Seen before?}:::orange-cross
  C -->|yes| D[Replay response]:::yellow
  C -->|no| E[Process request]:::red
  E -.-> F[Store result]:::green
```

Uncoloured nodes use the code foreground, and edges use the operator blue:

```diagram alt="Retry loop: send, wait for ack, retry on failure"
flowchart TB
  A[Send event] --> B{Ack received?}
  B -->|yes| C[Done]:::green-solid
  B -->|no| D[Back off]:::red-solid
  D --> A
```

Every colour and fill:

```diagram alt="The five palette colours in each of the three fill styles"
flowchart LR
  A[blue]:::blue --> B[red]:::red --> C[green]:::green --> D[orange]:::orange --> E[yellow]:::yellow
  F[blue]:::blue-solid --> G[red]:::red-solid --> H[green]:::green-solid --> I[orange]:::orange-solid --> J[yellow]:::yellow-solid
  K[blue]:::blue-cross --> L[red]:::red-cross --> M[green]:::green-cross --> N[orange]:::orange-cross --> O[yellow]:::yellow-cross
```

The previous hand-drawn look is still available with `style="sketch"`:

```diagram alt="The idempotency key flow, drawn by hand" style="sketch"
flowchart LR
  A[Client]:::blue --> B(API):::green-solid
  B --> C{Seen before?}:::orange-cross
  C -->|yes| D[Replay response]:::yellow
  C -->|no| E[Process request]:::red
  E -.-> F[Store result]:::green
```
