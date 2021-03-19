---
title: "What is x-hub-signature?"
date: 2021-03-19T10:30:00-03:00
summary: |
  TL;DR x-hub-signature is an HTTP body only signing scheme from the WebSub standard...
description: |
  What the x-hub-signature is, how it is used in webhooks to increase security, and
  it's origins from the WebSub standard.
---

*TL;DR* `x-hub-signature` is an HTTP **body only** signing scheme from the [WebSub standard][websub].

[Webhooks][webhook] are a common way on the modern web for one application to send events to another,
in a way that doesn't tightly couple the first application to the second. For example: Application one
(henceforth "Cat Bonnets Online") is configured by a customer at runtime to send events to application two
(henceforce "Chat App"). Cat Bonnets Online sends events in its own format to the configured endpoint
of Chat App. Chat App knows it gets webhook events from Cat Bonnets Online, and knows how to parse and
display them. Cat Bonnets Online knows nothing about Chat App, other than that it is another
endpoint that receives webhook events.

Chat App now has a public-facing URL that, when called, displays information from the received event to all
users of a given Chat App instance. That's great when those users want to know if someone bought them the
latest argyle cat bonnet. It's not so great when a bad actor discovers and calls the endpoint with hateful
and abuseive content.

Webhooks need **SECURITY**! `x-hub-signature` is a header containing an HMAC signature of the body of the
webhook request. During webhook configuration, Cat Bonnets Online and Chat App share a secret. This secret
is used in the HMAC, allowing Chat App to verify that all webhooks it receives have this header, and that
the HMAC is correct, assuring webhooks come from Cat Bonnets Online.

`x-hub-signature` is used by lots of applications that send webhooks ([GitHub][github], [Facebook][facebook], etc),
but without reference to where it comes from: the [WebSub standard][websub] (Formerly known as PubSubHubBub).
Knowing the connection can help answer questions like "Why does Facebook do a verification request with all
these hub.XXX parameters?" or "Is hub short for GitHub?", and help find the subtle differences between each
implementation.

It's too difficult to find the connection between `x-hub-signature` and [WebSub][websub].
Hopefully this post will help the search rankings of WebSub, even just a tiny bit. Spread the word!

Now that you know what `x-hub-signature` is, you should never use it for a new webhook implementation in 2021. Find out what to use instead in an exicting new post, coming soon!

[websub]: https://www.w3.org/TR/websub/ "WebSub W3C Recommendation"
[webhook]: https://en.wikipedia.org/wiki/Webhook "Webhook description on Wikipedia"
[hmac]: https://en.wikipedia.org/wiki/HMAC "HMAC description on Wikipedia"
[github]: https://docs.github.com/en/developers/webhooks-and-events/securing-your-webhooks "Github webhooks"
[facebook]: https://developers.facebook.com/docs/graph-api/webhooks/getting-started/ "Facebook webhooks"
