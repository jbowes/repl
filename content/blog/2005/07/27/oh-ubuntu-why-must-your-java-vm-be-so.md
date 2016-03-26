---
aliases: [/2005/07/oh-ubuntu-why-must-your-java-vm-be-so.html]
date: '2005-07-27T14:39:00.000-03:00'
lastmod: '2011-11-28T17:27:52.409-04:00'
slug: oh-ubuntu-why-must-your-java-vm-be-so
tags: [fedora]
title: Oh Ubuntu, why must your Java VM be so terrible?
---

  
Ubuntu has finally let me down. Breezy has, for some time now, had  
eclipse in available, using gcj (a gcc frontend that compiles java  
source to native code). Tonight, I figured I'd install eclipse at  
home, and play around with writing plugins. For added fun, I might  
grab a copy of Sun's java VM, and do some benchmarking. I was  
certainly willing to sacrifice portability for speed in this case, but  
it would be interesting to see just how much speed I was getting.  

  
  

  
**However**  

  
  

  
gcj also includes a java class file interpreter, gij. gij is slower than
frozen molasses (or treacle) traveling uphill against a strong headwind and
carrying 65 copies of _code complete_ (it's big and heavy, see?).  
gij is so slow that I was able to play a few levels of tetris in emacs while
waiting for each successive screen in the 'New Project' wizard to appear.  

  
  

  
It should be simple enough to grab Sun's VM from a third party,  
and use that instead of gcj, while still getting the benefits of  
having package management for the rest of my java goodness, but that's  
one more hoop to jump through, and I'm growing tired of jumping  
through hoops in my old age. One of these days I'll hook my foot on the bottom
of the hoop and get a nasty bruise when I land head-first on the ground.  

