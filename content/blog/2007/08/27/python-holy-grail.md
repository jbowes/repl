---
aliases: [/2007/08/python-holy-grail.html]
date: '2007-08-27T08:34:00.000-03:00'
lastmod: '2011-11-28T17:27:52.392-04:00'
slug: python-holy-grail
tags: [tech, fedora, ssl, python]
title: The Python Holy Grail
---

[This checkin](http://mail.python.org/pipermail/python-
checkins/2007-August/061867.html) to [python](http://www.python.org) brings a
long-awaited (and sorely needed, IMO) enhancement to python: SSL certificate
verification support. Once the API support percolates up from socket through
the various network libraries in python proper, for the vast majority of
developers there will no longer be a need for
[PyOpenSSL](http://pyopenssl.sourceforge.net/),
[M2Crypto](http://chandlerproject.org/Projects/MeTooCrypto), or
[rhnlib](http://rhn.redhat.com).

