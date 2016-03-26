---
aliases: [/2005/06/vimtutor.html]
date: '2005-06-20T13:15:00.000-03:00'
lastmod: '2011-11-28T17:27:53.081-04:00'
slug: vimtutor
tags: [fedora]
title: vimtutor
---

  
It was a matter of survival, I thought. I found myself in an  
environment where there were 2 kinds of people: those who used jedit,  
and those who used vim. The last emacs user had been given a pair of  
cement shoes. I wasn't going down that way; not me.  

  
  

  
So I gave it another shot. [Herk](http://fnordia.org/)  
had given me a nice wizz-bang demonstration of what an experience vim  
user can do, and I was impressed. This weekend, I went through  
vimtutor again, refamiliarized myself with the basics, and then went  
looking for vim's equivalents of some of my more frequently used emacs  
commands.  

  
  

  
Two selling points of vi and it's descendants are that their  
commands are concise (no C-x C-M-v RET twiddle-bitsticks), and that  
they work the same everywhere (the argument being that an emacs user's  
configuration file is filled with customizations). I liked these two  
points, but they fell apart when I tried to do more advanced  
operations, like sorting a region of text.  

  
  

  
M-x sort-lines will sort a region of lines alphabetically in  
emacs. This comes in handy when one wants to order some #defines, for  
example. In vim, I found two possible solutions. The first involved  
piping the text to the external sort command, then having it write  
back over the selected text. The second required installing a third  
party script. The first option is not concise, and both are not  
portable. This was typical for many other operations that I perform regularly
in emacs.  

  
  

  
I'll stick with emacs, for now. Hopefully I'll be able to outrun the vim
goons.  

