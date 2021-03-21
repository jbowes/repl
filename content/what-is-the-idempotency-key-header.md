---
title: "What is the idempotency-key header?"
date: 2021-03-22T11:30:00-03:00
summary: |
  
description: |
  They say the definition of idempotency is doing the same thing over and over again
  and expecting the same result.  
---

- summary of what it is (for ops that need idempotentcy but aren't natively so, plus what the heck idempotency is
- who uses it
- the draft spec
- *why* its used (high value txns, interaction with outside world, prevent dupes)
- don't let idempotency purity get in the way of utility (let the user know its a dupe)
- it should be a fallback (teaser to further posts?)

[idemspec]: https://tools.ietf.org/id/draft-idempotency-header-01.html "Early draft specification for the idempotency-key header"
