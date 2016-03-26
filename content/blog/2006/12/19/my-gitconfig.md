---
aliases: [/2006/12/my-gitconfig.html]
date: '2006-12-19T13:16:00.000-04:00'
lastmod: '2011-12-02T22:28:48.192-04:00'
slug: my-gitconfig
tags: [config_files, tech, fedora, SCM, whitespace, alias, git, cvs, svn]
title: My .gitconfig
---

**Update: **_I've posted a revised version of my .gitconfig [here.](http://http//blog.repl.ca/2011/12/my-gitconfig-2011-edition.html)_  
  
By default, git does not include aliases for commands. For instance,  
'git status' works but 'git st' does not. This will hurt your noggin if you
are  
used to using cvs or svn.  
Also, the internet is for posting config files on.  
So here are the contents of my .gitconfig:  

    
    
      
      
    [user]  
        name = James Bowes  
        email = MY_EMAIL  
      
    [alias]  
        ci = commit -a  
        co = checkout  
        st = status -a  
        praise = blame  
      
    [apply]  
        whitespace = strip  
      
    [diff]  
        color = auto  
        rename = copy  
      
    [pager]  
        color = true  
      
    [status]  
        color = auto

  
Just drop that into ~/.gitconfig and you're all set. Also, use your own name  
and email address.

