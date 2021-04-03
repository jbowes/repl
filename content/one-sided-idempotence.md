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

[Stripe][stripe]'s API is a strong proponent of idempotence, and typical in how it handles `DELETE` requests. 

```http
> GET /v1/products/prod_JEbKPQJxRVglrR HTTP/2
> Host: api.stripe.com
> authorization: Basic XXXX
> user-agent: curl/7.69.1
> accept: */*
> 
* Connection state changed (MAX_CONCURRENT_STREAMS == 128)!
< HTTP/2 200 
< server: nginx
< date: Sat, 03 Apr 2021 12:00:43 GMT
< content-type: application/json
< content-length: 430
< access-control-allow-credentials: true
< access-control-allow-methods: GET, POST, HEAD, OPTIONS, DELETE
< access-control-allow-origin: *
< access-control-expose-headers: Request-Id, Stripe-Manage-Version, X-Stripe-External-Auth-Required, X-Stripe-Privileged-Session-Required
< access-control-max-age: 300
< cache-control: no-cache, no-store
< request-id: req_SSP1cM0MxXXLTl
< stripe-version: 2020-08-27
< x-stripe-c-cost: 0
< strict-transport-security: max-age=31556926; includeSubDomains; preload
< 
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
* Connection #0 to host api.stripe.com left intact
```

```http
> DELETE /v1/products/prod_JEbKPQJxRVglrR HTTP/2
> Host: api.stripe.com
> authorization: Basic XXXX
> user-agent: curl/7.69.1
> accept: */*
> 
* Connection state changed (MAX_CONCURRENT_STREAMS == 128)!
< HTTP/2 200 
< server: nginx
< date: Sat, 03 Apr 2021 12:02:31 GMT
< content-type: application/json
< content-length: 76
< access-control-allow-credentials: true
< access-control-allow-methods: GET, POST, HEAD, OPTIONS, DELETE
< access-control-allow-origin: *
< access-control-expose-headers: Request-Id, Stripe-Manage-Version, X-Stripe-External-Auth-Required, X-Stripe-Privileged-Session-Required
< access-control-max-age: 300
< cache-control: no-cache, no-store
< request-id: req_7mhqwYAYZIJ5bZ
< stripe-version: 2020-08-27
< x-stripe-c-cost: 0
< strict-transport-security: max-age=31556926; includeSubDomains; preload
< 
{
  "id": "prod_JEbKPQJxRVglrR",
  "object": "product",
  "deleted": true
}
* Connection #0 to host api.stripe.com left intact
```

```http
> DELETE /v1/products/prod_JEbKPQJxRVglrR HTTP/2
> Host: api.stripe.com
> authorization: Basic c2tfdGVzdF81MUljNnFLRXdJMGN4MGQ5NlBPUFNvUEh0ejRXWGVJWWwwV1hWa01rQjFaYWVnTGhDTmlxMk1BVTdHdWVFc2J4SXlGUDRvcWdscUYzanQ3NW11RG5jNlJyUDAwckNhMWpIWnE6
> user-agent: curl/7.69.1
> accept: */*
> 
* Connection state changed (MAX_CONCURRENT_STREAMS == 128)!
< HTTP/2 404 
< server: nginx
< date: Sat, 03 Apr 2021 12:03:28 GMT
< content-type: application/json
< content-length: 236
< access-control-allow-credentials: true
< access-control-allow-methods: GET, POST, HEAD, OPTIONS, DELETE
< access-control-allow-origin: *
< access-control-expose-headers: Request-Id, Stripe-Manage-Version, X-Stripe-External-Auth-Required, X-Stripe-Privileged-Session-Required
< access-control-max-age: 300
< cache-control: no-cache, no-store
< request-id: req_ap9uieu4tpCnPk
< stripe-version: 2020-08-27
< x-stripe-c-cost: 0
< strict-transport-security: max-age=31556926; includeSubDomains; preload
< 
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
