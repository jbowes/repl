---
aliases: [/2010/10/measuring-network-speeds-with-netcat.html]
date: '2010-10-13T06:18:00.000-03:00'
lastmod: '2011-11-28T17:27:52.734-04:00'
slug: measuring-network-speeds-with-netcat
tags: [tech, fedora]
title: Measuring Network Speeds with Netcat and Dd
---

I've seen a few posts on the web about testing your network speeds with
netcat, but they all seem to not work with recent versions of netcat.  
  
On one machine, run:  
`  
nc -v -l 2222 > /dev/null  
`  
  
(Make sure you're not blocking connections to 2222!)  
  
On a second machine, run:  
`  
dd if=/dev/zero bs=1024K count=512 | nc -v $IP_OF_FIRST_MACHINE 2222  
`  
  
dd will give you your speed:  
`  
536870912 bytes (537 MB) copied, 4.87526 s, 117 MB/s  
`  
  
Yay, gigabit!  
  
_  
ymmv, test with /dev/zero at your own risk. Speak with your NOC before
starting any network infrastructure changes.  
_

