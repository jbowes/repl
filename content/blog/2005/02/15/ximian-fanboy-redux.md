---
aliases: [/2005/02/ximian-fanboy-redux.html]
date: '2005-02-15T15:07:00.000-04:00'
lastmod: '2011-11-06T10:07:16.120-04:00'
slug: ximian-fanboy-redux
tags: []
title: Ximian Fanboy Redux
---

  
The most recent episode of the always excellent  
[LugRadio](http://www.lugradio.org) features an interview with  
[Miguel](http://primates.ximian.com/~miguel). Mainly they talk about  
[Mono](http://www.mono-project.com), though there is a small bit  
in there on Ximian's history.  

  
  

The interesting point that one of the LugRadio guys brings up is  
this: what if, instead of paying 25 people to work full-time on Mono,  
Novell instead payed them to implement  
[f-spot](http://www.gnome.org/projects/f-spot),  
[Beagle](http://www.gnome.org/projects/beagle)(which is  
awesome), and [iFolder](http://www.ifolder.com) in C,  
[Python](http://www.python.org) or whatever?  

  
  

  
No doubt these projects could be further along, but would their growth  
rate be higher? Implementation is probably just as easy with Python as  
with C#, so its possible that there could be just as much momentum  
behind a Python implementation of Beagle as there is behind the C#  
Beagle.  

  
  

  
Desktop applications are not a reason to get behind Mono. in the end,  
the user is going to see the same (gtk+ ;) ) interface. The benefit in  
Mono is for the developer. Try this: open your favorite package  
management software (I'm crazy, I still use dselect), and search for  
[dbus](http://www.freedesktop.org/Software/dbus). What do  
you get? dbus, dbus-qt, dbus-python, dbus-glib, dbus-cli. The first  
four give you APIs for C, C++ using QT, Python, and C using glib. Four  
packages for four languages (three if you want to be technical), 4  
different APIs to learn. The last package, dbus-cli, lets you access  
dbus from any language implemented on the CLI, and the interface will  
always be the same, after you mangle it a bit for your chosen  
language.  

