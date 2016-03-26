---
aliases: [/2011/12/my-gitconfig-2011-edition.html]
date: '2011-12-02T21:55:00.001-04:00'
lastmod: '2011-12-05T09:22:18.018-04:00'
slug: my-gitconfig-2011-edition
tags: [tech, fedora, git, config]
title: My .gitconfig - 2011 Edition
---

It's been just shy of five years since I [first blogged about my .gitconfig
file](http://blog.repl.ca/2006/12/my-gitconfig.html), so I figured now would
be a good time to revisit it. If you're not already aware, you can set git
configuration values in a .gitconfig file in your home directory, and have
them apply to all [git](http://git-scm.org/) repositories you work on. This is
particularly useful for aliases and to set your email address.  
  
My current .gitconfig:  
  
[user]  

    
    
        name = James Bowes  
        email = $EMAIL_ADDRESS  
      
    [alias]  
        ci = commit -a  
        co = checkout  
        st = status  
        praise = blame  
        br = branch  
        diffstat = diff --stat  
        cat = !cat @  
        ds = diff --stat  
        lol = log --graph --decorate --pretty=oneline --abbrev-commit  
        lola = log --graph --decorate --pretty=oneline --abbrev-commit --all  
      
    [apply]  
        whitespace = warn  
      
    [diff]  
        rename = copy  
        renamelimit = 600  
      
    [pager]  
        color = true  
      
    [color]  
        branch = auto  
        diff = auto  
        interactive =auto  
        status = auto  
      
    [push]  
        default = upstream  
      
    [github]  
        user = jbowes  
        token = $GITHUB_TOKEN  
      
    

  
I cribbed _lol _and _lola_ from
[Adrian](http://adrianlikins.com/2011/05/gitconfig/). Naturally, there's now a
[github](http://github.com/) section. I get the most use out of
_diff.renamelimit_, which helps me when I'm doing merges in large projects
like [Candlepin](http://candlepinproject.org/), and the _ds_ alias, which
gives me a good overview of how much work I've done prior to a commit.

