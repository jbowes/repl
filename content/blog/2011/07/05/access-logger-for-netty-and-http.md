---
aliases: [/2011/07/access-logger-for-netty-and-http.html]
date: '2011-07-05T09:01:00.000-03:00'
lastmod: '2011-11-06T10:02:36.555-04:00'
slug: access-logger-for-netty-and-http
tags: [tech, fedora]
title: An Access Logger for Netty and HTTP
---

We needed to do [CLF](http://en.wikipedia.org/wiki/Common_Log_Format "Common
Log Format" ) style HTTP access logging for
[Thumbslug](https://fedorahosted.org/candlepin/ "Candlepin" ), which is
implemented in Java + [Netty](http://www.jboss.org/netty "Netty" ). I couldn't
find any code to do this with a quick google search, so I wrote my own. If you
need such a thing, try [here](http://git.fedorahosted.org/git/?p=thumbslug.git
;a=blob;f=src/main/java/org/candlepin/thumbslug/HttpRequestLogger.java) or
[here (backup)](https://gist.github.com/1065230 "Github gist" ).

