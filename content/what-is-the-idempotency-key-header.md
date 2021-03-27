---
title: "What is the idempotency-key header?"
date: 2021-03-24T11:06:00-03:00
summary: |
  In Computer Science (and in its cooler older sibling, Mathematics) idempotence is a property of an action
  (e.g. an API call) such that doing the action again with the same inputs produces the same result. In the context
  of HTTP, a GET request is usually idempotent...
description: |
  They say the definition of idempotency is doing the same thing over and over again
  and expecting the same result.  
---

In Computer Science (and in its cooler older sibling, Mathematics) [idempotence][idemp] is a property of an action
(e.g. an API call) such that doing the action again with the same inputs produces the same result. In the context
of HTTP, a `GET` request is usually idempotent; making a request to the same URL should return the same response,
and not change any relevant data in the backing data store. A `DELETE` request is likewise typically idempotent;
no matter how many times you `DELETE` a given URL, the resource stays deleted after the first call, no other
resources are deleted, etc.

Idempotence is a great property for APIs to have. Idempotence coupled with retries can mitigate many problems
related to the unreliability of networks, computers, and software. If any request along the chain between the
client and your data store fails, the downstream initiator can safely retry. Even impatient users frantically
clicking buttons and refreshing pages are no match for idempotence!

Looking at the HTTP methods used in REST APIs, some are inherently idempotent, and others are not:
- `GET`: Show me the thing I asked for. **IDEMPOTENT**
- `DELETE`: Ensure the thing I referenced does not exist. **IDEMPOTENT**
- `PUT`: Ensure the thing I gave you exists exactly as I gave it to you. **IDEMPOTENT**
- `PATCH`: Apply the provided set of changes to the current state of the thing I referenced. **NOT IDEMPOTENT**
- `POST`: Create this thing I gave you (usually at a different URL), or modify a thing based on inputs and its current state. **NOT IDEMPOTENT**

`POST` and `PATCH` are not idempotent. `PATCH` is especially resistant to being made idempotent, as a `PATCH` operation
is meant to apply context-aware changes to a resource in its current state. Applying the same change multiple times, as
the resource's state is updated, will at best result in an error, and at worst result in a new state that the caller
didn't intend. Strategies like [optimistic concurrency control][optcon] are often best for `PATCH`.

`POST`, on the other hand, can be made idempotent - particularly for uses meant to create a resource. If we're
building an API to sell Cat Bonnets, `POST` requests to create new store listings could include the bonnet `size`
and `color` as the most important and meaningful fields. A content-aware idempotence scheme would treat any `POST`s
with the same `size` and `color` as intention to ensure such a listing exists. As long as one already does, the
`POST` won't create a new one; `N > 1` requests to create a large blue bonnet always result in only 1 large blue
bonnet existing.

The [`idempotency-key`][idemspec] header is another way to bring idempotence to non-idempotent HTTP methods
(particularly `POST`). The caller can supply a unique value for the header. If the header is supplied, then the
server returns the same response for any requests with the same value for `idempotency-key` (usually within a 24
hour window; we can't expect infinite storage). But if we can make a `POST` idempotent based on the request contents,
what's the use of this header?

A hint lies in companies that implement it: [Stripe][stripe], [Square][square], and [Twilio][twilio] (to name a few).

These are companies that provide APIs interacting with the outside world, where each action is expensive
(sometimes in real money), and the expense compounds with duplicates (e.g. charging a user twice for the same good also
damages reputation).

An SMS API wants to let its clients send a message to user X with message body "you have a new notification" more than
once, maybe within minutes or seconds of each other, or even at the same time. Further, they also want to allow the
clients to have a means to prevent duplicate sends if from the client's point of view, there is only one message. Doing
this with content-based idempotence would require additional significant fields in the request body, ultimately boiling
down to a unique key - essentially identical to the `idempotency-key` header. Putting the field in an HTTP header allows
for easier reuse between API endpoints, and keeps values out of the schema that aren't directly meaningful for the problem
space.

Ignoring any imposed expiration on `idempotency-key` values, adding the header to `POST` requests makes them look a lot
like `PUT`s: The unique value a client uses for `idempotency-key` maps to the URL (typically including a unique ID in
the path) that they would call `PUT` on. There are a few reasons why a `PUT` may not make sense for an API:
- You may want full control over your resource IDs and their URLS; letting a client provide them in `PUT`s would give that control up.
- The scheme for your IDs is complex enough that expecting clients to create them is unreasonable; letting them provide arbitrary `idempotency-key` values is easier.
- You don't want to persist any of the request resources. `PUT`ing wouldn't make sense, as the resource won't exist at the URL after the operation is finished.

As a final note, *this* post is not idempotent. Repeated readings may further enhance your understanding of idempotence for
APIs.

[idemp]: https://en.wikipedia.org/wiki/Idempotence "Wikipedia's description of idempotency"
[idemspec]: https://tools.ietf.org/id/draft-idempotency-header-01.html "Early draft specification for the idempotency-key header"
[optcon]: https://en.wikipedia.org/wiki/Optimistic_concurrency_control "Wikipedia's description of optimistic concurrency control"
[stripe]: https://stripe.com "Stripe homepage"
[square]: https://squareup.com "Square homepage"
[twilio]: https://twilio.com "Twilio homepage"
