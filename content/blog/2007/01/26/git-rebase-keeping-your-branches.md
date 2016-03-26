---
aliases: [/2007/01/git-rebase-keeping-your-branches.html]
date: '2007-01-26T15:29:00.000-04:00'
lastmod: '2011-11-28T17:27:53.006-04:00'
slug: git-rebase-keeping-your-branches
tags: [tech, fedora, SCM]
title: 'git rebase: keeping your branches current'
---

Where possible, I use [git](http://git.or.cz) for my scm now. All software on
[dangerously incompetent](http://dangerouslyincompetent.com) is stored in git,
and I do my personal [yum](http://linux.duke.edu/projects/yum/) work with
[git-cvsimport](http://www.kernel.org/pub/software/scm/git/docs/git-
cvsimport.html). One of the reasons I like git so much is [git-
rebase](http://www.kernel.org/pub/software/scm/git/docs/git-rebase.html).
Here’s an example of how it works:  
  
There is some upstream project that you wish to work on. You clone this
upstream project when it is in state _A_, and make some changes. Your personal
branch is now in state _Ab_, that is, _A_ plus some set of changes _b_.  

    
    
    upstream ==========A  
      
    you                +=====Ab

  
Now, while you’ve been writing _b_, more changes have occurred upstream. These
changes may or may not also be contained in _b_. Upstream is now in state _A’_  

    
    
    upstream ==========A==========A'  
      
    you                +=====Ab

  
Now, how do you get the differences between _A_ and _A’_ into your branch?
With many distributed scms, you would perform a merge. The merge will take the
differences between _A_ and _A’_ and apply them on top of _Ab_ (this is a
greatly simplified explaination, of course). Over time, you end up with a
history in your branch that interleaves changes from upstream with your own
changes. Merge is an option with git, but you can also perform a **rebase**.  
  
With a rebase, the changes between _A_ and _Ab_ are taken and reapplied at
_A’_:  

    
    
    upstream ==========A==========A'  
      
    you                           +=====A'b

  
So your own changes are always the most recent. In practice, I find this to be
a very elegant approach. git-rebase makes it easy to see and manipulate your
own set of changes against the upstream codebase.

