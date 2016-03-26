---
aliases: [/2006/11/software-configuration-management.html]
date: '2006-11-18T13:54:00.000-04:00'
lastmod: '2011-11-28T17:27:53.106-04:00'
slug: software-configuration-management
tags: [tech, fedora]
title: Software Configuration Management
---

Two things have got me thinking about SCMs lately:  

  

  * Discussion on[ Fedora Maintainers](https://www.redhat.com/archives/fedora-maintainers/2006-November/thread.html) about replacing CVS with a distributed SCM.
  

  * Hacking on[ Yum](http://linux.duke.edu/projects/yum/) (which uses CVS), and needing some way to keep track of my patches.
  
  
For Yum, I've been using a copy of the CVS repository imported into[
Git](http://git.or.cz/). This is working so nicely that it has led to explore
replacing [SVN](http://subversion.tigris.org) for[ dangerously
incompetent](http://dangerouslyinc.com).  
  
So far I've done a test import of [Wuja](http://www.dangerouslyinc.com/wuja)
into various distributed SCMs. `git svnimport` worked fine. Conversion to
[Mercurial](http://www.selenic.com/mercurial) via  
[Tailor](http://www.darcs.net/DarcsWiki/Tailor) choked a bit on the tags, but
is otherwise ok. I was unable to get either Tailor or `bzr svn` to convert the
repository to [Bazaar](http://www.bazaar-vcs.org).  
  
Some interesting figures:  
  
  
  
| svn  
| hg  
| git  
| raw  
  
---|---|---|---|---  
  
  
Size (KiB)  
| 1888  
| 1636  
| 1096  
| 464  
  
  
  
In each case, disk usage is for a checkout of the main branch (i.e. trunk).
The raw data from trunk HEAD is 464 KiB. Subversion requires 1424 KiB for
metadata; this only contains information about the current revision. Mercurial
and Git require 1172 and 632 KiB, respectively. The interesting part is that
Mercurial and Git store the _complete history_ of the repository in their
metadata. You get far more information in much less space.

