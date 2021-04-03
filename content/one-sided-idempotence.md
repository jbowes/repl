---
title: One-Sided Idempotence
date: 2021-03-27T18:06:00-03:00
summary: |

description: |

---

In the last post, we [discussed the idempotency-key header][idemkey], and how this header can be used to add
idempotence to otherwise non-idempotent HTTP methods (like `POST`) in REST APIs. We also touched on how many
HTTP methods are inherently idempotent, like `DELETE`. But just how idempotent is it, in practice?

To recap, `DELETE` is an idempotent HTTP method because after the first request to delete a resource, a client
can make any number of subsequent duplicate `DELETE` requests, and the resource will stay deleted. The end state
on the server side stays the same, no matter how many `DELETE` requests it sees. Idempotent requests like `DELETE`
have another interesting property: After that first request, failures, errors, and malformed or misinterpreted
requests maintain the same state on the server side. *Side note: If you've ever seen a bug that caused a resource
to be re-created on a failed delete, [let me know on twitter][jamestwitter]. I'd love to hear about it.*

"server side" is important here. Discussion of idempotence usually focuses on the server (or whoever holds the
canonical state), glossing over its impact on the client; it's a one-sided view. The client is important too,
particularly in distributed systems, where "the client" might be one of many hops between the server and a user. 

Idempotence, when paired with retries, provides resilience against failures in the network, etc. If a wire is tripped
over when the server is responding `2XX` to a `DELETE`, but before the client reads that response (and the client
eventually times out), then at some point, the client will retry the request. How the server responds to that
second request will impact the complexity of the client's logic for handling replies, and may ultimately end up
impacting what an end user sees.

[Stripe][stripe]'s API makes ample of idempotence, and typical in how it handles `DELETE` requests. 

```http
GET /v1/products/prod_JEbKPQJxRVglrR HTTP/1.1
Host: api.stripe.com
```
```http
HTTP/1.1 200 OK
Content-Length: 430
Content-Type: application/json

{
  "id": "prod_JEbKPQJxRVglrR",
  "object": "product",
  "active": true,
  "attributes": [

  ],
  "created": 1617451149,
  "description": "A premium hobby-grade cat bonnet.",
  "images": [

  ],
  "livemode": false,
  "metadata": {
  },
  "name": "Cat Bonnet",
  "package_dimensions": null,
  "shippable": null,
  "statement_descriptor": null,
  "type": "service",
  "unit_label": null,
  "updated": 1617451217,
  "url": null
}
```

```http
DELETE /v1/products/prod_JEbKPQJxRVglrR HTTP/1.1
Host: api.stripe.com
```
```http
HTTP/1.1 200 OK
Content-Length: 76
Content-Type: application/json

{
  "id": "prod_JEbKPQJxRVglrR",
  "object": "product",
  "deleted": true
}
```

```http
DELETE /v1/products/prod_JEbKPQJxRVglrR HTTP/1.1
Host: api.stripe.com
```
```http
HTTP/1.1 404 Not Found
Content-Length: 236
Content-Type: application/json

{
  "error": {
    "code": "resource_missing",
    "doc_url": "https://stripe.com/docs/error-codes/resource-missing",
    "message": "No such product: 'prod_JEbKPQJxRVglrR'",
    "param": "id",
    "type": "invalid_request_error"
  }
}
```

TODO: stripe example

explain: extra logic for client

explain: are you responding to the event, or the desired state?

explain: why not both? respond to desired state, make sure return values work for this, additional header to indicate
if change occurred.

applies to PUT, too

[idemkey]: https://repl.ca/what-is-the-idempotency-key-header/ "What is the Idempotency-Key Header?"
[jamestwitter]: https://twitter.com/jrbowes "James' twitter account"
[stripe]: https://stripe.com "Stripe homepage"
