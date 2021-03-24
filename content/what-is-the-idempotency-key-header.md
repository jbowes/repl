---
title: "What is the idempotency-key header?"
date: 2021-03-22T11:30:00-03:00
summary: |
  
description: |
  They say the definition of idempotency is doing the same thing over and over again
  and expecting the same result.  
---

In Computer Science (and in its cooler older sibling, Mathematics) [idempotence][idemp] is a property of an action
(e.g. an API call) such that doing the action again with the same inputs produces the same result. In the context
of HTTP, a `GET` request is usually idempotent; making a request to the same URL should return the same response,
and not change any relevant data in the backing data store. A `DELETE` request is likewise typically idempotent;
no matter how many times you `DELETE` a given URL, the resource stays deleted after the first call, no other
resources are deleted, etc. How subsequent `DELETE`s show up in responses is more subtle than `GET`; we'll come
back to that.

Idempotence is a great property for APIs to have. Idempotence coupled with retries can mitigate many problems
related to the unreliability of networks, computers, and software. If any request along the chain between the
client and your data store fails, the downstream initiator can safely retry. Even impatient users frantically
clicking buttons and refreshing pages are no match for idempotence!

Looking at the HTTP methods used in REST APIs, some are inherantly idempotent, and others are not:
- `GET`: Show me the thing I asked for. **IDEMPOTENT**
- `DELETE`: Ensure the thing I referenced does not exist. **IDEMPOTENT**
- `PUT`: Ensure the thing I gave you exists exactly as I gave it to you. **IDEMPOTENT**
- `PATCH`: Apply the provided set of changes to the current state of the thing I referenced. **NOT IDEMPOTENT**
- `POST`: Create this thing I gave you (usually at a different URL), or modify a thing based on inputs and its current state. **NOT IDEMPOTENT**

`POST` and `PATCH` are not idempotent. `PATCH` is especially resistant to being made idempotent, as a `PATCH` operation
is meant to apply context-aware changes to a resource in its current state. Applying the same change multiple times, as
the resource's state is updated, will at best result in an error, and at worst result in a new state that the caller
didn't intend. Strategies like [optimistic concurrency control][optcon] are often best for `PATCH`.

`POST`, on the other hand, can be made idempotent - particularly for uses meant to create a resource.

- summary of what it is (for ops that need idempotentcy but aren't natively so, plus what the heck idempotency is
- who uses it
- the draft spec
- *why* its used (high value txns, interaction with outside world, prevent dupes)
- don't let idempotency purity get in the way of utility (let the user know its a dupe)
- it should be a fallback (teaser to further posts?)

[idemp]: https://en.wikipedia.org/wiki/Idempotence "Wikipedia's description of idempotency"
[idemspec]: https://tools.ietf.org/id/draft-idempotency-header-01.html "Early draft specification for the idempotency-key header"
[optcon]: https://en.wikipedia.org/wiki/Optimistic_concurrency_control "Wikipedia's description of optimistic concurrency control"
