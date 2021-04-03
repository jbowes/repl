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

For a real-world example of how responses from idempotent requests can impact clients, let's look at an example using
[Stripe][stripe]. Stripe's API makes ample use of idempotence, and is typical in how it handles `DELETE` requests. First,
assume we have the following product defined:

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

This product is a hobby-grade cat bonnet for sale in our online cat bonnet marketplace, listed by an independent
cat bonnet artisan. Imagine the artisan decides to stop selling this particular cat bonnet. Their pressing of a
delete button in the UI triggers the following call in the cat bonnet marketplace:

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

The `200` response indicates success, and the response is a sparse representation of the deleted product.
Note that while the [Stripe docs on products][stripeprod] say the product is returned, the only data we
get is values we could infer from the request itself.

Now, imagine if the backend server never saw that `200` response, and retried its request to delete. This
is the response it would get:

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

A `404`, indicating (since it's a `4XX` series response) that the client made a mistake, and this resource
doesn't exist. The end result from Stripe's perspective is still that the product is deleted, but now, unless
the cat bonnet marketplace backend accounts for a `404` response status, and the difference in the response
bodies, the end user may see an error message instead of success.

In the case of Stripe, the API is *responding to to the requested change* and not *responding to the desired state* (
this is similar to [edge vs level triggering](edgevlevel)). If the API treats a `DELETE` as "ensure this resource does
not exist" instead of "delete this existing resource", then so long as the resource does not exist at the end of a `DELETE`
request, the server can respond with a `200 OK`, the client will know that the resource doesn't exist (as it desired),
and the client doesn't require any additional logic for treating `404` responses as successes.

Back to Stripe's original `200` response: It's documented as returning the deleted object, but only returns the object type
and id (both of which are included in the `DELETE` request). Many APIs do return the full deleted object. Be careful with
this when designing APIs; you'd make extra work for yourself trying to return the deleted object for multiple delete requests.

Sometimes, it matters to the client if the resource being deleted actually was deleted by them or not. In those cases, 
you could either encourage the client to `GET` the resource first, and see if it exists (ignoring a possible race condition),
or include an additional response header or field on the body indicating if that request caused a delete.

Designing APIs requires balancing tradeoffs, predicting common usage patterns, and aiming for simplicity. Next time you
implement `DELETE`, consider if always returning `200` may be best. But be careful to not introduce inconsistencies with other
`DELETE` endpoints in an existing API.

[idemkey]: https://repl.ca/what-is-the-idempotency-key-header/ "What is the Idempotency-Key Header?"
[jamestwitter]: https://twitter.com/jrbowes "James' twitter account"
[stripe]: https://stripe.com "Stripe homepage"
[stripeprod]: https://stripe.com/docs/api/products/delete "Stripe API docs on product deletion"
[edgevlevel]: https://link.medium.com/zWGns5U69eb "Level Triggering and Reconciliation in Kubernetes"
