---
aliases: [/2007/06/xterm-like-fonts-for-gnome-terminal-in.html]
date: '2007-06-04T17:36:00.000-03:00'
lastmod: '2011-11-06T10:06:53.625-04:00'
slug: xterm-like-fonts-for-gnome-terminal-in
tags: [tech, fedora, config files]
title: xterm-like fonts for gnome-terminal in Fedora 7
---

I like using gnome-terminal, but I find the default fonts hard on my eyes. So
I don't forget (and for anyone who is interested), here are the steps to use
xterm's default font in gnome-terminal:  

  

  1. As root, run _`yum -y install bitmap-fonts`_
  

  2. As root, run _`ln -s /etc/fonts/conf.avail/70-yes-bitmaps.conf /etc/fonts/conf.d/`._
  

  3. Close all open gnome-terminal windows.
  

  4. Launch gnome-terminal and edit the current profile.
  

  5. Uncheck 'Use the system fixed width font' and click on the font button.
  

  6. Select 'MiscFixed' and set the font size to 10.
  

  7. Your terminals now look crispy in the dark.
  

