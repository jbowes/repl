---
title: "Modern webhook signatures in 2021"
date: 2021-03-19T10:30:00-03:00
summary: |
  x-hub-signature isn't good enough. Fortunately, there's a standard for that™...
description: |
  x-hub-signature isn't good enough. Fortunately, there's a standard for that™
---

*This post is a follow-up to the previous post on [`x-hub-signature`][xhub]*

It's 2021, and you work for Cat Bonnets Online. The bigwigs up on the top floor
just finished telling you over Zoom that the company is modernizing its strategy.
Half the company is converting the bonnets to [NFTs][nft] (Nice Feline Toppings),
and the rest is working on a [Clubhouse][clubhouse] strategy, your team is adding
[webhooks][webhook].

You want to sign your webhooks, so receivers can verify you sent them. Don't use
`x-hub-signature` for this. It's not good enough, and there's a better option in 2021:
[The "Signing HTTP Messages" draft specification][httpsig]. This new specification 
addresses three shortcomings in `x-hub-signature`:

**Headers can be included in the signature**: If your webhook includes important
information in headers (for example, event or account identifiers), it should be
signed, so the receiver can ensure they haven't been tampered with.

**There's a facility for expiration**: Sent requests can have an expiration time,
mitigating replay attacks. If your events are not [idepmpotent][idemp] (or the
receiver doesn't treat them as such) a bad actor could intercept a request, and 
repeatedly send it to the reciever. This could lead to resource exhaustion, lost
data, or inconsistent state.

**Asymmetric keys are supported**: `x-hub-signature` implementations use symmetric
keys for signing and verification. While this is faster than asymmetric forms, it
means a bad actor could steal the key from your system, from the receiver, or while
it's in transit between the two during setup. With asymmetric keys, you only need
worry about having the key stolen from your own system.

The first two issues with `x-hub-signature` (unsigned headers and no expiration) can
be solved in a layer above the signature, by including **all** details only in the
message body, and having an application defined expiration. It's too easy to let
important data slip into the headers over time, or for a receiver to not implement
the extra step of checking the expiration time. Why not let a specification (and
hopefully a standard library) handle it for you and your receivers?

[xhub]: https://repl.ca/what-is-x-hub-signature/ "What is x-hub-signature?"
[nft]: https://en.wikipedia.org/wiki/Non-fungible_token "Wikipedia's description of non-fungible tokens"
[clubhouse]: https://www.joinclubhouse.com/ "Some app or something. not the cooking spice brand. I'm disappointed, too"
[webhook]: https://en.wikipedia.org/wiki/Webhook "Webhook description on Wikipedia"
[httpsig]: https://datatracker.ietf.org/doc/draft-ietf-httpbis-message-signatures/ "Signing HTTP Messages IETF tracker"
[idemp]: https://en.wikipedia.org/wiki/Idempotence "Wikipedia's description of idempotence"
