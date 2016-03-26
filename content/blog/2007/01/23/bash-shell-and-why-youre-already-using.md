---
aliases: [/2007/01/bash-shell-and-why-youre-already-using.html]
date: '2007-01-23T16:24:00.000-04:00'
lastmod: '2011-11-28T17:27:53.043-04:00'
slug: bash-shell-and-why-youre-already-using
tags: [tech, fedora]
title: The Bash shell and why you’re already using it
---

This is, of course, a reply to [Devan’s
post](http://dgoodwin.dangerouslyinc.com/?q=node/27) about the [Z
shell](http://zsh.org), as I was one of the curious folks always bugging him
about why he used it.  
  
First, the one advantage I know of that zsh has over bash: It lets me say “The
Zed Shell” which is great fun down here in North Carolina.  
  
The default keybinding for interactive command history search is **ctrl-r**
(search backward through the history). This command prompts for input, rather
than using what has already been typed. You can set up history search like zsh
has with:  
`  
$ bind ctrl-p:history-search-backward  
$ bind ctrl-n:history-search-forward  
`  
  
Intelligent tab completion is enabled by default in most linux distributions,
if not, you probably just have to comment out a line in your bashrc, or
install a bash-completion package.  
  
Devan’s right; bash has all of the directory stack features that he listed for
zsh.  
  
**alias -g** and **alias -s** do seem to be unique to zsh. _You’ve won this round, Zed Shell._  
  
In bash, you can also use the **!** to recall command history with find and
replace.  
  
**vim **/file.py** will open the first file named **file.py** in your directory tree in bash, too.  
  
zsh does have a few more features than bash. I have yet to see anything
revolutionary enough to make me switch shells. Unfortunately for zsh, it has
an uphill battle against all of the test systems I work with that come pre-
installed with bash.

