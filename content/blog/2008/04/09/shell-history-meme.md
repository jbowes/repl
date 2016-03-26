---
aliases: [/2008/04/shell-history-meme.html]
date: '2008-04-09T10:12:00.000-03:00'
lastmod: '2011-11-28T17:27:52.605-04:00'
slug: shell-history-meme
tags: [tech, fedora, meme, bash, shell]
title: Shell HIstory Meme
---

`[jbowes@laptop ~]$ history | awk '{a[$2]++ } END{for(i in a){print a[i] " "
i}}'|sort -rn|head  
211 git  
148 fg  
107 ls  
99 cd  
89 python  
43 make  
26 vim  
23 sudo  
20 nosetests  
19 player/swfplay`  
  
`[jbowes@workstation ~]$  history | awk '{a[$2]++ } END{for(i in a){print a[i]
" " i}}'|sort -rn|head -n 12  
163 ls  
156 cd  
115 svn  
76 vim  
70 screen  
55 fg  
47 exit  
35 sudo  
30 git  
21 yasql`  
  
Seen on [Adrian's](http://adrianlikins.com/archives/2008/04/08/shell-history-
meme/) and [Mike's](http://www.michaeldehaan.net/?p=583) blogs.

