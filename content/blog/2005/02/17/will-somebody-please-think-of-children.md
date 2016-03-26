---
aliases: [/2005/02/will-somebody-please-think-of-children.html]
date: '2005-02-17T01:53:00.000-04:00'
lastmod: '2011-11-06T10:07:16.020-04:00'
slug: will-somebody-please-think-of-children
tags: []
title: Will Somebody Please Think of the Children?!
---

Yes, [Phil](http://flame.cs.dal.ca/~pobrien/blog.cgi/gentoo)  
and I will be installing [Gentoo](http://www.gentoo.org) on his  
lappy; that's his choice. For anyone else out there who's considering  
using Gentoo, I'd recommend against it.

  
  

As the  
[Pragmatic Programmers](http://www.pragmaticprogrammer.com/) point  
out, _Don't Repeat Yourself_; this is just as true for repeating  
someone else, as well. Another distribution (say,  
[Ubuntu](http://www.ubuntulinux.org)), will provide you with  
pre-compiled packages, saving you hours upon hours of time. Don't  
concern yourself with USE flags and C flags; the small speedup you may  
gain is counterbalenaced by the time you have to spend configuring and  
compiling, and the headache it causes developers when you submit a bug  
report saying you compiled with -OINT_MAX. If its absolutely necessary  
for you to get that tiny speed increase for a critical application, every  
other distribution will let you download and build a package from source,  
as well.

  
  

If you worry more about the USE flags, and want to trim the fat  
from a package, so to speak, by removing ARTS support and keeping  
GStreamer support, invest your time in a way that will benefit more  
than yourself. Add modularity to the package, so that these backends  
can be shipped as seperate packages.

