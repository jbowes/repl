---
aliases: [/2005/03/hard-and-soft.html]
date: '2005-03-07T15:38:00.000-04:00'
lastmod: '2011-11-06T10:07:16.065-04:00'
slug: hard-and-soft
tags: []
title: The hard and the soft
---

  
Like a lot of kids earning their nerd stripes back in the day, I  
had played around with
[VMWare](http://www.vmware.com/products/desktop/ws_features.html). Remember
VMWare,  
that program that  
would let you run FreeBSD in Windows in Linux? Those were good times.  
Then there was [Plex86](http://plex86.sourceforge.net/),  
which was going to do the same thing, and  
be Free as well, only it never really got off the ground.  

  
  

  
Nowadays, I guess people still use VMWare, and there's also  
[qemu](http://fabrice.bellard.free.fr/qemu/)  
and [User-mode Linux](http://user-mode-linux.sourceforge.net/)  
(used quite effectively at [Linode](http://www.linode.com).  
And then there's Xen.  

  
  

  
[Xen](http://www.cl.cam.ac.uk/Research/SRG/netos/xen/) is  
load-balancing on large doses of illicit  
substances. Xen is a microkernel and supporting code that presents  
itself as something similar to an x86 machine to code running on top of it.  
It has no device  
drivers and the like; instead it lets details like those be handled by  
an operating system running on top of Xen. So, you have one primary OS  
instance that controls the low-level hardware, and interfaces with Xen  
for configuration purposes. Then, you can have an arbitrary number of  
other OSs running on top of Xen as well, all at the same time.  

  
  

  
Back to load-balancing: So you've got 5 instances of Linux running  
on your server running Xen. One OS runs the webserver, the other the  
database, etc (you're a good little sysadmin; you keep everything  
seperate so the hax0rs can't hurt you). Xen lets you allocate  
resources to each OS instance, so you can have the webserver OS access  
256MB of RAM, or 50% of your CPU cycles, for instance. But what if  
your resources are maxed out, and all of a sudden your database has to  
process a nasty query? Xen will let you move that database-running OS  
instance to a  
_different physical machine_, in real-time, without affecting  
the OS. There are some caveats, of course: The two machines have to be  
on the same subnet, and the storage space must somehow be accessible  
by both of them, but that's some crazy stuff, right there.  

