---
title: The Deceptive Complexity of Subscription APIs
date: 2021-04-05T11:06:00-03:00
summary: |

description: |

---

setup: you want to provide a near-realtime feed of things happening via an api, users get updates on the status of their same day cat bonnet delivery,
etc.

solution: subscription APIS! websockets, graphql subscriptions, server sent events, etc.
instead of periodically requestiong status from the API (polling), the client opens a connection, and has the server push new changes to it.

problem: subscription style APIs are deceptively complex.

caveat: subscription apis are usually event (diff) style. they may capture full state as well.

Ask yourself:
- is it bad if a client misses an event, or recieves events out of order. will that corrupt state?
- if the client misses an event or recieves events out of order, could an end user misinterpret things?
- will anyone else besides you use this API?
- no, really. someone else could use this API, right?

the subtleties of using a subscription api could be mitigated by you, the author, when writing a client. As soon as another developer is involved,
you are fighting against the style of the API itself to ensure it's usable and not bug prone for someone else's consumption.

Example API goes here.

Example application.

send event stream.
reconnects! add event numbers.
how much state to store? 
fetch the whole thing again on reconnect? miss some events.
ordering of fetch vs event sub.