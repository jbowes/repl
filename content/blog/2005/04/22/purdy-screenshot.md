---
aliases: [/2005/04/purdy-screenshot.html]
date: '2005-04-22T05:32:00.000-03:00'
lastmod: '2011-11-06T10:06:53.641-04:00'
slug: purdy-screenshot
tags: []
title: Purdy Screenshot
---

  
I spent some time on the weekend, while I was at Ms. Vissers's  
house, working on adding ACL display and manipulation to  
[gnome-keyring-manager](http://cvs.gnome.org/viewcvs/gnome-keyring-manager). I
finished  
it up yesterday, and imported it into GNOME CVS.  

  
  
  
![A picture of the gnome-keyring-manager window.](http://www.cs.dal.ca/~bowes
/gkm-acl.png)  
  
  

  
Those paying close attention may notice that there is neither the  
ability to add, nor to remove, application access controls to/from a  
key. This is intentional; I can't come up with any compelling  
use-cases where someone would do these actions within g-k-m.  

  
  

  
Access controls get added when an application first tries to access a key and  
the user chooses to always allow the application to access the key. G-k-m can  
then be used to fine-tune the application's access rights. If users could add  
a.c.s from within g-k-m, you could end up with pointless entries in a  
key's acl.  

  
  

  
Removal of an application access control is really pointless (unless you're  
worried about disk usage or something silly like that). Removing an a.c. makes  
the key forget about the application. Next time the application tries to  
access the key, a new a.c. will be created (if you allow access). It's better  
to just set the permissions that you want on that access control.  

  
  

  
Gnome keyring manager should have absolute control over all keys  
(once the keyring they're on is unlocked by the user, of course), so  
any a.c.s for g-k-m are not shown in the UI, to prevent the user from  
mucking about with them. Finding the proper a.c. to hide is done using  
/proc/self/exe to get the application's full path, so right now it's  
linux-centric. If anyone knows a more general POSIXy way of doing this,  
let me know.  

