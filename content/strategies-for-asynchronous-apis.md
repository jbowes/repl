---
title: Strategies for Asynchronous APIs
date: 2021-04-07T11:06:00-03:00
summary: |

description: |

---

Most APIs will require some form of non-blocking or asynchronous mechanisms for specific endpoints. It could be an
import task that takes minutes or hours, report generation, or even deleting a resource. In any case, whatever the caller
is asking for can't be done immediately, but the caller would like to know when its done (for example, so a user can view
the report) and may like to know about progress (for example, so they can show import task status in a UI). If you're lucky,
you'll catch most of these at the start, though inevitably some change in requirements, features, or performance
characteristics will require changing an API from blocking or non-blocking.

## Strategies

### Pretend and defer

Pretending that the API is still synchronous, and deferring expensive work, is often the best option for retrofitting
existing APIS, as you can keep the same interface.

### Block and de-duplicate

Use idempotence to de-duplicate (link to other post)

good for retrofitting.

### Resources with status

ref: kubernetes and watson api guidelines

resources first: import resource
*or* status field on thing in question.

```http
POST /v1/cat-bonnets HTTP/1.1
Content-Type: application/json

{
  "name": "red bonnet"
}

HTTP/1.1 201 Created
Location: /v1/cat-bonnets/3f566245-754a-44af-82fd-b754d4b03fb6
Content-Language: en-CA
Content-Type: application/json

{
  "id": "3f566245-754a-44af-82fd-b754d4b03fb6",
  "name": "red bonnet",
  "status": [
    {
      "state": "sewing",
      "time": "xxxx",
      "description": "Expert craftspersons are sewing your new bonnet."
    },
    {
      "state": "accepted",
      "time": "xxxx",
      "description": "Your bonnet has been accepted for processing."
    }
  ]
}
```

Status may exist directly on a resource that has meaning for end users (ref watson spec here).
It may also exist on a resource that is mostly meaningful for the long-running task itself, but
also has use as a record or log, eg an `Import` type.

### Job specific indirect resources

A job specific indirect resource has a few differences from putting status on a resource:
- The job specific resource is often a generic type, like `Job`, `Operation`, or similar.
- Its lifetime may be short, say only 24 hours after task completion or failure.
- They are often created **indirectly** at the server's discretion.

The last point can be powerful; it gives the server the option of responding immediately,
or giving the client a URL to use for polling results, making this decision at runtime.

Expanding on the Cat Bonnet creation example above, given the following request:

```http
POST /v1/cat-bonnets HTTP/1.1
Content-Type: application/json

{
  "name": "red bonnet",
  "fabic": "purest unicorn mane"
}
```

The server could reference warehouse stock for `purest unicorn mane` to determine if the
Cat Bonnet could be fabricated in a reasonable amount of time, or if there is no stock,
and fabricating the bonnet may require an asynchrous response.

If there is stock, the server can create the bonnet and respond immediately:

```http
HTTP/1.1 201 Created
Location: /v1/cat-bonnets/3f566245-754a-44af-82fd-b754d4b03fb6
Content-Language: en-CA
Content-Type: application/json

{
  "id": "3f566245-754a-44af-82fd-b754d4b03fb6",
  "name": "red bonnet"
}
```

If, on the other hand, there is no stock, the server can respond with a `202 Accepted` and
point the client at an endpoint for polling status:

```http
HTTP/1.1 202 Accepted
Location: /v1/jobs/27440252-c84a-40aa-8a17-8c3532eb8aca
Content-Type: application/json

{
  "description": "Cat Bonnet creation accepted",
  "status_id": "27440252-c84a-40aa-8a17-8c3532eb8aca"
}
```

Note that [`202 Accepted`][202] is intentionally non-commital and vaguely defined. Further,
[`Location`][loc] has no defined meaning when used with it. However, convention in APIs has landed
on using the two together for non-blocking APIs.

XXX: job endpoint example goes here

XXX: when done, either 200 or even 201 with location

**Flexibility is complexity** every client will have to know how to handle a direct response and
an indirect non-blocking response. Take this into account; it may be better to always return a
`202 Accepted` response, even for fast replies.

## Inline versus dedicated status

benefits and drawbacks to each

## Variants

### Callback URLs

### Push on state change

SSE, websockets

[202]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/202 "Mozilla's definition of 202"
[loc]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Location "Mozilla's definition of the Location header"
