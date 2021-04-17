---
title: Strategies for Asynchronous APIs
date: 2021-04-08T11:06:00-03:00
summary: |

description: |

---

Most APIs will require some form of non-blocking or asynchronous mechanisms for specific endpoints. It could be an
import task that takes minutes or hours, report generation, or even deleting a resource. In any case, whatever the caller
is asking for can't be done immediately, but the caller would like to know when its done (for example, so a user can view
the report) and may like to know about progress (for example, so they can show import task status in a UI). If you're lucky,
you'll catch most of these at the start, though inevitably some change in requirements, features, or performance
characteristics will require changing an API from blocking or non-blocking.

## Required machinery

If a given API endpoint must be asynchronous, you can assume the work it has to do will take longer than a single HTTP request.
Further, if the work will take longer than a single HTTP request, you can assume it will take longer than the lifetime of 
your server process.

You'll need to decouple the work from HTTP requests (say, with a background worker process or thread), and make the work durable
and resilient to process crashes / restarts (with task queues, etc). With care, you can make these changes before modifying existing
public APIs or introducing new ones.

## Strategies

### Pretend and defer

Pretending that the API is still synchronous, and deferring expensive work, is often the best option for retrofitting
existing APIs. If your API continues to pretend the action is synchronous, you can keep the same interface.

This strategy works best for actions that can tolerate [eventual consistency][evencon] in some of their data, or for actions
that can mitigate inconsistency via other means.

Pretend and defer is often applied to user / account deletion. An account deletion may require cascading deletes to all
owned data in the same service, calls to other services to delete owned data, calls to third party services to remove
records of the account, and possibly some time-delayed actions to perform accounting at the end of a billing period.

Instead of blocking and waiting for all this work to complete, an account deletion API can mark the account as disabled
and revoke any authentication tokens, effectively making the account inaccessible. Any expensive work is then done later on,
either via direct work scheduling from the API, or through bulk cleanup processes.

### Block and de-duplicate

For cases where an existing API endpoint's work can't be deferred, you can maintain the existing API (until it's been
removed via a deprecation policy), run the work in a background task, and de-duplicate requests via [idempotency][idempkey].

Treat each HTTP request as a request to enqueue background work, keeping the request open. Have the server poll the background
worker on behalf of the client, returning a response when the background work is done. Use idempotency (likely based on the
contents of the request) to de-duplicate in-flight requests, pointing them all at the same in-process background work.

If the long-running work completes before the client times out (or the server crashes, etc), then from the client's perspective,
the API has not changed. If the client times out, and retries, then idempotency assures that the client resumes tracking the same
original work. If the client does not retry, then the work will complete, regardless.

### Resources with status

While the first two strategies are half-steps meant to support backwards compatibility, adding a `status` field to a resource
is a cleaner, more complete solution, that may also break backwards compatibility.

In this strategy, any API request to create a resource creates it right away, filling in as many details as possible,
with the addition of a status field, which records state transitions as the resource progresses from an accepted request, to
a completed and created resource.

For example, consider creating a new Cat Bonnet that is hand sewn on demand:

```http
POST /v1/cat-bonnets HTTP/1.1
Content-Type: application/json

{
  "name": "red bonnet"
}
```
```http
HTTP/1.1 201 Created
Location: /v1/cat-bonnets/3f566245-754a-44af-82fd-b754d4b03fb6
Content-Language: en-CA
Content-Type: application/json

{
  "id": "3f566245-754a-44af-82fd-b754d4b03fb6",
  "name": "red bonnet",
  "status": [
    {
      "state": "accepted",
      "time": "2021-04-08T07:22:03Z",
      "description": "Your bonnet has been accepted for processing."
    }
  ]
}
```

The `POST` response returns the pending Cat Bonnet resource. The client can then poll the server, watching
the state of the Cat Bonnet:

```http
GET /v1/cat-bonnets/3f566245-754a-44af-82fd-b754d4b03fb6 HTTP/1.1
```
```http
HTTP/1.1 200 OK
Content-Language: en-CA
Content-Type: application/json

{
  "id": "3f566245-754a-44af-82fd-b754d4b03fb6",
  "name": "red bonnet",
  "status": [
    {
      "state": "sewing",
      "time": "2021-04-08T07:23:49Z",
      "description": "Expert craftspersons are sewing your new bonnet."
    },
    {
      "state": "accepted",
      "time": "2021-04-08T07:22:03Z",
      "description": "Your bonnet has been accepted for processing."
    }
  ]
}
```

Eventually, the Cat Bonnet will be fully sewn and complete. Hooray!

As in the above example, status may exist directly on a resource that has meaning for end users.
It may also exist on a resource that is mostly meaningful for the long-running task itself, but
also has use as a record or log, like an `Import` type.

For resource modification or `DELETE`s, the resource proper can stay in its old state, until the status progresses to the point where
the modification is complete.

Note that this is similar to, but not the same as, [Kubernetes' status field][kubestatus], which fully describes the current state
of a resource *and optionally* may include fields describing the resource's state transition history.

For additional context, the [IBM Watson REST API Guidelines][watasync] have additional details on a similar style of asynchronous
API.

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
  "fabric": "purest unicorn mane"
}
```

The server could reference warehouse stock for `purest unicorn mane` to determine if the
Cat Bonnet could be fabricated in a reasonable amount of time, or if there is no stock,
and fabricating the bonnet may require an asynchronous response.

#### Direct response

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

#### Indirect response

If, on the other hand, there is no stock, the server can respond with a `202 Accepted` and
point the client at an endpoint for polling status:

```http
HTTP/1.1 202 Accepted
Location: /v1/jobs/27440252-c84a-40aa-8a17-8c3532eb8aca
Content-Language: en-CA
Content-Type: application/json

{
  "description": "Cat Bonnet creation accepted",
  "status_id": "27440252-c84a-40aa-8a17-8c3532eb8aca"
}
```

Note that [`202 Accepted`][202] is intentionally non-committal and vaguely defined. Further,
[`Location`][loc] has no defined meaning when used with it. However, convention in APIs has landed
on using the two together for non-blocking APIs.

The client can then make repeated requests to the `/v1/jobs` endpoint returned in the `Location` header
to get the status of the Cat Bonnet creation.

```http
GET /v1/jobs/27440252-c84a-40aa-8a17-8c3532eb8aca HTTP/1.1
```
```http
HTTP/1.1 200 OK
Content-Language: en-CA
Content-Type: application/json

{
  "id": "27440252-c84a-40aa-8a17-8c3532eb8aca",
  "status": [
    {
      "state": "sewing",
      "time": "2021-04-08T09:15:49Z",
      "description": "Expert craftspersons are sewing your new bonnet."
    },
    {
      "state": "accepted",
      "time": "2021-04-08T07:22:03Z",
      "description": "Your bonnet has been accepted for processing."
    }
  ]
}
```

Once done creating the Cat Bonnet, the server can reply with an updated `status` including information
on where to find the created Cat Bonnet. It's also acceptable and common to return a `201 Created` response
with a `Location` header:

```http
HTTP/1.1 201 Created
Location: /v1/cat-bonnets/3f566245-754a-44af-82fd-b754d4b03fb6
Content-Language: en-CA
Content-Type: application/json

{
  "id": "27440252-c84a-40aa-8a17-8c3532eb8aca",
  "status": [
    {
      "state": "created",
      "time": "2021-04-08T09:15:49Z",
      "description": "Your new bonnet is ready.",
      "bonnet_id": "3f566245-754a-44af-82fd-b754d4b03fb6"
    },
    {
      "state": "sewing",
      "time": "2021-04-08T09:15:49Z",
      "description": "Expert craftspersons are sewing your new bonnet."
    },
    {
      "state": "accepted",
      "time": "2021-04-08T07:22:03Z",
      "description": "Your bonnet has been accepted for processing."
    }
  ]
}
```

It's OK to reply with a `201 Created` after the Cat Bonnet is created, but it isn't OK to respond with a
`4XX` series status code on error. A `4XX` series code should be served in response to the direct request
for the job status only (for example, if the client asked for a job ID that didn't exist).

### Flexibility is complexity

Every client will have to know how to handle a direct response and
an indirect non-blocking response. Take this into account; it may be better to always return a
`202 Accepted` response, even for fast replies.

## Picking a style

Most often the style of asynchronous API you choose is influenced by existing APIs, data, schema, etc.
If you're mostly free from those constraints, your choices are likely between:
- `status` on end-user meaningful resources (for example directly on Cat Bonnets)
- `status` on job-specific indirect resources (for example creating a `Job` to track sewing a new Cat Bonnet)

Both of these styles can handle asynchronous resource creation, modification, or deletion, whereas direct creation
of a job-specific resource like an `Import` may complicate your API for modification or deletion. An import resource
can be useful to track when a single entity was imported into a system, but pairing it with a `Deletion` resource, or
placing long-running delete status directly on the imported entity makes less sense.

Given the two options then, your choice should be influenced by how useful the `status` data is, and how badly a client
can break their application by ignoring the data.

At Manifold, our API had both styles of API for creating (buying) a resource (SaaS DB) over the years.

We began with job-specific resources. These were problematic for display in the frontend UI; the client was responsible
for merging the list of *real* resources with the ones that were in the middle of creation, plus modifying the real ones
for any in-flight change or delete jobs. Performing this merge was extra work for the frontend client, and error prone.
We would end up with out of order lists, or missing in-creation resources, or duplicate entries for the real resource plus
its modification job.

Changing the API to have `status` directly on resources made the client simpler. Even if the client ignored the `status`
field, the list of resources would always be correct, only misidentifying in-creation resources as live ones. If that bug
ever occurred, further user interaction might fail, but it was far better to show the resource than miss displaying it.

So again, the best style for your API will depend on how you expect clients to consume it.

### What goes in `status`?

The most useful `status` fields are arrays of objects like those shown in the examples above, sorted in newest to oldest:

```json
[
  {
    "state": "accepted",
    "time": "2021-04-08T07:22:03Z",
    "description": "Your bonnet has been accepted for processing."
  }
]
```

A machine readable state field (which could terminate on `completed` or `errored`), coupled with a human-readable
description field should give enough data for meaningful progress feedback. If you have it, you could add estimated time to
completion, as well.

Be careful of too many possible state transitions; you don't want this array to grow to hundreds (or even tens) of entries.
If that's possible, you may wish to truncate to the last `N` entries, instead of resorting to pagination.

If your data doesn't have meaningful state progressions, a `percent_complete` field can work just as well. Add it in addition
to the `state` field, so `state` can indicate `running`, `completed`, or `errored`.

## Variants

The above strategies require the client to make repeated requests to the server (polling) to get the latest state of a
request. Polling is excellent for client simplicity and compatibility; if a client can make an HTTP request to start an
asynchronous action, they can make further requests to get the status. However, polling adds additional work for your
server to do, and will add some latency from when work is finished to when the client knows (depending on the polling interval).
You may wish to support additional features to reduce latency for the client or load on your server.

### Callback URLs

### Push on state change

Instead of requiring the client to make new requests for status periodically, they can instead open a long-lived connection with
[WebSockets][websock] or [Server-Sent Events][sse], allowing the server to push state changes to them, as they happen. Push-based APIs
such as these require your infrastructure to take on an additional level of state, tracking who has subscriptions to what, across your
fleet of servers. It can be deceptively difficult to set up, and support may vary across different infrastructure providers and technologies.

Pushing on state change is most applicable to clients that maintain sessions and state, like web browsers or mobile apps.

[evencon]: https://en.wikipedia.org/wiki/Eventual_consistency "Wikipedia's description of eventual consistency"
[idempkey]: https://repl.ca/what-is-the-idempotency-key-header/ "What is the idempotency-key header?"
[watasync]: http://watson-developer-cloud.github.io/api-guidelines/#asynchronous-operations "IBM Watson REST API Guidelines"
[kubestatus]: https://kubernetes.io/docs/concepts/overview/working-with-objects/kubernetes-objects/ "Kubernetes spec and status"
[202]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/202 "Mozilla's definition of 202"
[loc]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Location "Mozilla's definition of the Location header"
[websock]: https://en.wikipedia.org/wiki/WebSocket "Wikipedia's description of WebSockets"
[sse]: https://en.wikipedia.org/wiki/Server-sent_events "Wikipedia's description of Server-Sent Events"
