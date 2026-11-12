---
title: "Diagram test page"
date: 2026-11-12T12:00:00-04:00
summary: |
  Demo of hand-drawn rough.js diagrams built from Mermaid-style text. Remove before merging.
description: |
  Demo of hand-drawn rough.js diagrams built from Mermaid-style text.
---

A sequence diagram:

```diagram alt="A provider sends a signed webhook and the receiver verifies it before replying 200"
sequenceDiagram
  participant P as Provider
  participant R as Receiver
  P->>R: POST /webhook (signed)
  R->>R: verify signature
  R-->>P: 200 OK
```

A left-to-right flowchart with boxes, a rounded node, a diamond, and a dashed edge:

```diagram alt="Idempotency key flow: replay the stored response if the key was seen, otherwise process and store it"
flowchart LR
  A[Client] -->|Idempotency-Key| B(API)
  B --> C{Seen before?}
  C -->|yes| D[Replay response]
  C -->|no| E[Process request]
  E -.-> F[Store result]
```

A top-to-bottom flowchart:

```diagram alt="Retry loop: send, wait for ack, retry on failure"
flowchart TB
  A[Send event] --> B{Ack received?}
  B -->|yes| C[Done]
  B -->|no| D[Back off]
  D --> A
```
