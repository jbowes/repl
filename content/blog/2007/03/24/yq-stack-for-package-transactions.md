---
aliases: [/2007/03/yq-stack-for-package-transactions.html]
date: '2007-03-24T09:50:00.000-03:00'
lastmod: '2011-11-28T17:27:52.533-04:00'
slug: yq-stack-for-package-transactions
tags: [tech, fedora]
title: 'yq: a stack for package transactions'
---

[yq](http://dangerouslyinc.com/yq) is a little command line program I've been
coding up over the past week to solve a specific problem I encounter quite
regularly. Often I will install a program via
[yum](http://linux.duke.edu/projects/yum) to try it out, only to decide I
don't like it. The problem occurs when the installed program brings in
dependencies; if you want these removed along with the program, you'll need to
remember all of them. So, my frequent testing of programs results in a lot of
built-up cruft on my machine.  
  
A solution to this problem are rollbacks. [rpm](http://rpm.org) does have
built-in rollback support. I am not interested in saving all of the previously
installed rpms on my disk when I install or upgrade something new, nor am I
interested in saving each and every rpm transaction.  
  
yq leverages yum to perform transaction rollbacks and replays. Since the rpms
you are dealing with are already in a yum repository, yq only records the
names of these rpms.  
  
The design for yq is influenced by patch management programs like
[quilt](http://www.die.net/doc/linux/man/man1/quilt.1.html), which is where
the stack comes into play. Transactions that you create can be pushed and
popped onto/off of the stack, changing the state of your system.  
  
You can [download yq](http://dangerouslyinc.com/yq), or [browse the
sources](http://git.dangerouslyinc.com/?p=yq;a=summary) via gitweb.

