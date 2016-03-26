---
aliases: [/2007/02/git-bisect-practical-example-with-yum.html]
date: '2007-02-18T16:59:00.000-04:00'
lastmod: '2011-11-28T17:27:52.950-04:00'
slug: git-bisect-practical-example-with-yum
tags: [tech, fedora, SCM, mutt, git, git_bisect, yum-scm]
title: 'git bisect: A practical example with yum'
---

I used [git bisect](http://www.kernel.org/pub/software/scm/git/docs/git-
bisect.html) to track down a bug in [yum](http://linux.duke.edu/projects/yum/)
last night. It was so easy and practical that I figured I should record it
here, so that others might want to give git a try.  
  
I was attempting to install [mutt](http://www.mutt.org/), and yum failed
(printing a traceback) after the rpms had been downloaded, but before the test
transaction finished. So I started git bisect, and marked the current point as
bad:  
  
`$> git bisect start  
$> git bisect bad  
`  
  
The yum 3.1.0 release didn't have this bug (it was the version I had installed
at the time), so I marked it as good:  
  
`$> git bisect good yum-3-1-0  
Bisecting: 15 revisions left to test after this  
[1d0454af41ef6361604cafa8c7a13d80bc183c63] make it so that we see that the
local rpm is present and then don't download  
`  
  
[Git](http://git.or.cz) automatically checks out the next revision for you to
test. This one happened to be good, so I marked it as such. I continued to
test and mark revisions as either good or bad, until:  
  
`$> git bisect bad  
832814e6b037621c4f26ee6a47e4b7b6dc7eb073 is first bad commit  
commit 832814e6b037621c4f26ee6a47e4b7b6dc7eb073  
Author: XXX  
Date: XXX  
XXXXXXXXXXXXXXXX  
:100644 100644 8ea07cda8441687da2f0e3dd794c3a1c50a0f161
567ef25557eacbd932bc5f8c20cd34e49c169f57 M cli.py  
:100644 100644 50fb320c9c31a0f394985e244dc35b9766fb28ce
3875b70c4f8a7b6a9cf7d06de6df47e8a0ae5777 M yum-updatesd.py  
:040000 040000 28296caad31015e1573b19dd84d12c2e3db2b90b
98048391465ca3da06c210d6f45c3f234dc12e0a M yum  
`  
  
At this point, with the traceback and the diff from the commit, it was easy
enough figure out what the problem was, and commit a fix.

