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
mitigating replay

[xhub]: https://repl.ca/what-is-x-hub-signature/ "What is x-hub-signature?"
[nft]: https://en.wikipedia.org/wiki/Non-fungible_token "Wikipedia's description of non-fungible tokens"
[clubhouse]: https://www.joinclubhouse.com/ "Some app or something. not the cooking spice brand. I'm disappointed, too"
[webhook]: https://en.wikipedia.org/wiki/Webhook "Webhook description on Wikipedia"
[httpsig]: https://datatracker.ietf.org/doc/draft-ietf-httpbis-message-signatures/ "Signing HTTP Messages IETF tracker"
