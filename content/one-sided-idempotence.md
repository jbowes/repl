---
title: One-Sided Idempotence
date: 2021-03-27T18:06:00-03:00
summary: |

description: |

---

In the last post, we [discussed the idempotency-key header][idemkey], and how this header can be used to add
idempotence to otherwise non-idempotent HTTP methods (like `POST`) in REST APIs. We also touched on how many
HTTP methods are inherently idempotent, like `DELETE`. But just how idempotent is it, in practice?

- cover what makes delete idempotent
  - even on a catastrophic failure on a subsequent delete, the resource remains deleted and so in the desired state.
  - if you've ever seen a bug that caused a resource to be created on a failed delete, let me know on twitter; i'd love to hear about it!
- this is only about the server side, what about the client? the idempotent view is one sided
- talk abouthow some clients return 200 with deleted content, or 204 with nothing. or 404 / 400 when already deleted
  - what does stripe do?
- cover ways the client could adapt, either to 2XX or 4XX responses.
- include additional headers?
  - best solution: 204 with optional header indicating prior deletion. why best?
  - be nice to clients, incremental adoption
- Applies to PUT, too.

[idemkey]: https://repl.ca/what-is-the-idempotency-key-header/ "What is the Idempotency-Key Header?"
