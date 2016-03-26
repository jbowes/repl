---
aliases: [/2012/07/give-absolute-path-for-client.html]
date: '2012-07-13T14:01:00.001-03:00'
lastmod: '2012-07-13T14:01:23.948-03:00'
slug: give-absolute-path-for-client
tags: [fedora, ssl, curl]
title: Give the absolute path for a client certificate with curl
---

If you're expecting _curl --cert somefile.pem_ to work, and you keep getting
403s in response, it might be because your curl is compiled against NSS, and
that cert is being interpreted as an alias to an NSS DB entry. Use _curl
--cert ./somefile.pem_ instead. Fwiw, this is documented in the curl man page,
but who looks there?  
  
...Or use wget instead.

