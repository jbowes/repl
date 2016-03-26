---
aliases: [/2012/04/connect-client-implementation-for-netty.html]
date: '2012-04-24T10:23:00.000-03:00'
lastmod: '2012-04-24T10:23:14.661-03:00'
slug: connect-client-implementation-for-netty
tags: [fedora, ssl, proxy, java, netty]
title: A CONNECT Client Implementation for Netty
---

If you need an implementation of an [HTTP
CONNECT](https://tools.ietf.org/html/rfc2616#section-9.9) client to tunnel SSL
(or anything else) through a proxy using [Netty](http://netty.io/), Chris
Duryee and I recently landed a patch to do so in
[Thumbslug](https://fedorahosted.org/candlepin/wiki/thumbslug/Index).  
  
By all means, make use of it!  
  
The original changeset is [here](http://git.fedorahosted.org/git/?p=thumbslug.
git;a=commit;h=813697226726ababafa7fcd6eabcfd2c610f9779).

