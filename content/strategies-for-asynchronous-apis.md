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

## Option 1: Pretend and defer

Pretending that the API is still synchronous, and deferring expensive work, is often the best option for retrofitting
existing APIS, as you can keep the same interface.

## Option 2: Block and de-duplicate

Use idempotence to de-duplicate (link to other post)

good for retrofitting.

## Option 3: Resources with status

ref: kubernetes and watson api guidelines

resources first: import resource
*or* status field on thing in question.

```http
POST /v1/cat-bonnets HTTP/1.1

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

## Option 4: Job specific resources

The dangerous allure of 202 and Location

benefits and drawbacks to each

## Variant: Callback URLs

## Variant: Push on state change

SSE, websockets
