---
aliases: [/2007/02/did-i-mention-that-svn-sucks.html]
date: '2007-02-11T08:46:00.000-04:00'
lastmod: '2011-11-28T17:27:53.144-04:00'
slug: did-i-mention-that-svn-sucks
tags: [tech, fedora, SCM, git, svn]
title: Did I mention that svn sucks?
---

`$> svn co svn://gcc.gnu.org/svn/gcc/trunk gcc  
$> cd gcc  
$> du -h  
...  
1.6G .  
$> svn export . ../clean-gcc  
$> cd ../clean-gcc  
$> du -h  
...  
638M .  
$>  
`  
  
Oh, yes, [I did](http://jbowes.dangerouslyinc.com/2006/11/18/software-
configuration-management/).

