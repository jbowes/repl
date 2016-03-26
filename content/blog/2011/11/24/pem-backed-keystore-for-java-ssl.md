---
aliases: [/2011/11/pem-backed-keystore-for-java-ssl.html]
date: '2011-11-24T12:49:00.001-04:00'
lastmod: '2011-11-28T17:27:53.135-04:00'
slug: pem-backed-keystore-for-java-ssl
tags: [tech, fedora, ssl, pem]
title: A PEM Backed Keystore for Java SSL
---

For [Thumbslug](https://fedorahosted.org/candlepin/wiki/thumbslug/Index), we
needed to open a number of [SSL](http://en.wikipedia.org/wiki/SSL) connections
to the same server, each with its own
[X.509](http://en.wikipedia.org/wiki/X.509) client certificate. Thumbslug
grabs the certificates from [Candlepin](http://candlepinproject.org/), which
stores them in
[PEM](http://en.wikipedia.org/wiki/X.509#Certificate_filename_extensions)
format. Rather than teach Candlepin to also store these certificates in a
different format, or to load them first into a format that Java deals with
nativley (like [PKCS #12](http://en.wikipedia.org/wiki/PKCS12)), I figured it
would be best to create an SSLSession backed directly by an X509Certificate
and PrivateKey loaded from the PEM file.

  

I wasn't able to find any other examples of a PEM backed Java KeyStore, so
[here is mine](http://git.fedorahosted.org/git?p=thumbslug.git;a=blob_plain;f=
src/main/java/org/candlepin/thumbslug/ssl/PEMx509KeyManager.java;hb=HEAD)
([backup](https://gist.github.com/1391823)), and the [code that uses it](http:
//git.fedorahosted.org/git?p=thumbslug.git;a=blob;f=src/main/java/org/candlepi
n/thumbslug/ssl/SslContextFactory.java;h=b8791e0b4910c2f1adf347015df5110b2f6ac
9bb;hb=HEAD#l102) ([backup](https://gist.github.com/1391824)). Since PEM is
still widely used (by OpenSSL, for example), hopefully others can make use of
this.

