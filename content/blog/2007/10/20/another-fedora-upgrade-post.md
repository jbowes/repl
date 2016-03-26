---
aliases: [/2007/10/another-fedora-upgrade-post.html]
date: '2007-10-20T08:44:00.000-03:00'
lastmod: '2011-11-06T10:02:36.573-04:00'
slug: another-fedora-upgrade-post
tags: [rawhide, tech, fedora, upgrade, debian, yum]
title: Another Fedora Upgrade Post
---

[Devan](http://dgoodwin.dangerouslyinc.com) and I were chatting a bit about
Fedora upgrades this morning. Given that he and I are both recovering
[debian](http://www.debian.org) users, we do miss
([apparently](http://www.debian.org/releases/stable/i386/release-notes/ch-
upgrading.en.html)) seamless live upgrades between releases. So following on
the heels of [Doug](http://www.silfreed.net/content/some-clarifications-and-
concessions) and [Devan](http://dgoodwin.dangerouslyinc.com/more-fedora-live-
upgrades-discussion), here is my take on upgrades.  
  
First, offline upgrades will **always** be required for some cases. There's
always going to be some cruft we need to drop, and can't do it on a live
system.  
  
Second, allowing upgrades from release X to X+2, etc is too risky and would
need more QA than I think we'd be willing to commit. Likewise for rawhide to
stable, or stable to rawhide. These all should be possible for the intrepid,
but not defaults options.  
  
**A use case for upgrades**  
  
Franky Fedora is a Fedora user. He uses a default install, and is not familiar
with the command line. Whenever the update applet appears at the top right of
his screen, he launches it and updates his system. One day, instead of the
regular update icon, a different one appears with a popup message "A new
version of Fedora is available! please click to upgrade."  

  

  1. Franky double clicks on the icon.
  

  2. Franky is presented with information about the upgrade, including release notes and an advisory to back up any important data before continuing, as well as a choice to continue or cancel.
  

  3. Franky selects continue, and is presented with a list of tasks, as they complete, they are checked off. The list looks like:  
  

    * Updating current release
  

    * Downloading software for upgrade
  

    * Preparing system for upgrade
  

    * Upgrading system
  
  

  

  4. As time progresses, the items on the list are checked off. Meanwhile, Franky is free to do other tasks.
  

  5. Once all items on the list are checked off, Franky is presented with a message telling him that his upgrade is complete, and advised to reboot his system. He is given the choice to reboot now, or not to reboot if he wishes to complete other tasks.
  

  6. Frankly chooses to reboot. His system restarts, and he is presented with the next Fedora release, and all of its [wonderful new artwork](http://people.redhat.com/duffy/artwork/24hr-infinity.png).
  
  
**Extension Points:**  
  
2a. Franky selects cancel, and is returned to his regular desktop.  
  
3a. Franky's system requires a new filesystem, so he is presented with the
following tasks instead:  

  

  * Updating current release.
  

  * Downloading software for upgrade.
  

  * Rebooting system info upgrader.
  
  

  

  1. As the items on the list are checked off, Franky is free to do what he wishes.
  

  2. When the final item is checked off, Franky is presented with a message telling him his system must be restarted to continue the upgrade. He can select to reboot now, or to do so on his own later.
  

  3. Franky chooses to reboot now.
  

  4. His system restarts, and runs the Anaconda installer.
  

  5. Once complete, Franky's machine reboots into the new Fedora release.
  
  
5a. Franky chooses to reboot later, and is returned to his regular desktop.  

  

  1. Later he reboots, and moves on to step 6.
  
  
**Proposed implementation details**  

  

  * An upgrades metadata file added to the main repository metadata. This file will contain a pointer to the new Fedora release, as well as some caveats for upgrading. For instance, that the i386 version of dbus must be removed before upgrading.
  

  * The upgrades file will specify whether a live or offline upgrade should be done.
  

  * The caveats will run during the 'Preparing system for upgrade' step.
  

  * The updating current release step is just a 'yum update' after it is completed, the upgrade tool shall restart, if it has been updated during this process.
  

  * The caveats metadata will be updated over time if any new issues arise.
  
  
Interaction between the upgrades metadata and other repos may get hairy. How
does the system know what do to when you are running updates versus updates-
testing? Perhaps each repo should have upgrades metadata.  
  
This is all an extension to the F9
[PreUpgrade](http://fedoraproject.org/wiki/Features/PreUpgrade) feature.
Getting the Anaconda reboot working is a great first step. Once that's done,
we can move on to the optional live upgrade, a command line interface, etc.  
  
Comments/flames appreciated.

