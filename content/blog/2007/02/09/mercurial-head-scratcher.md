---
aliases: [/2007/02/mercurial-head-scratcher.html]
date: '2007-02-09T19:31:00.000-04:00'
lastmod: '2011-11-28T17:27:52.759-04:00'
slug: mercurial-head-scratcher
tags: [tech, fedora, wtf]
title: Mercurial Head Scratcher
---

I'm trying to generate a patch to send to a project that uses
[Mercurial](http://www.selenic.com/mercurial) for their scm. In the middle of
some commits, I did an 'hg pull' and 'hg merge'. Since I did not have '[git
rebase](http://jbowes.dangerouslyinc.com/2007/01/26/git-rebase-keeping-your-
branches-current/)' available, I now have the merged code right in the middle
of my commits. If all of my commits were adjacent, I could run 'hg diff -r a
-r b' to get a patch containing all of the changes. They're not, so I can't.  
  
In [git](http://git.or.cz), I could run 'git diff master' to compare my branch
to the master branch, and get a single diff containing all the changes. I
tried to find a similar command for hg. The closest I could find was 'hg
outgoing -p'; but this still contains the changes from the merged upstream
code. Other examples for accomplishing this on the hg website are so
convoluted as to make the average [perl](http://www.perl.org) programmer balk.  
  
In the end, I had to do a fresh clone, then diff the two directories.  
  
Maybe I'm missing something, but how is it people can think that Mercurial is
easier than git?

