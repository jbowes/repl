---
aliases: [/2011/12/essential-gnome-shell-extensions-for.html]
date: '2011-12-06T18:57:00.001-04:00'
lastmod: '2011-12-08T10:32:09.107-04:00'
slug: essential-gnome-shell-extensions-for
tags: [tech, fedora, linux, gnome, config]
title: Essential Gnome Shell Extensions For Laggards
---

[![](http://upload.wikimedia.org/wikipedia/commons/6/6f/Terminal-dec-
vt100.jpg)](http://upload.wikimedia.org/wikipedia/commons/6/6f/Terminal-dec-
vt100.jpg)  
---  
_My ideal workstation_  

__Image by [ClickPick](http://commons.wikimedia.org/wiki/User:ClickRick), used
under the ____  

___Creative Commons___  
___[Attribution-Share Alike 3.0 Unported
license.](http://creativecommons.org/licenses/by-sa/3.0/deed.en)___

____

__  
Gnome 3 introduced a lot of fundamental changes to how you interact with your
computer. I don't want to hopelessly cling to the past, bemoaning the loss of
my [Lisp based window
manager](http://en.wikipedia.org/wiki/Sawfish_\(window_manager\)) and yearning
for the days when I could debate the merits of pure applets vs notification
area icons, so I've moved on to gnome-shell.  
  
That said, I've been using a few tweaks to bring Gnome 3 and gnome-shell
closer to what I'm used to. Consider them training wheels; they can be
disabled over time, easing the transition.  
  
Here are the extensions I use, and some settings tweaks. Most extensions are
available from [http://extensions.gnome.org](http://extensions.gnome.org/).
The ones that aren't can typically be downloaded via your distro's packaging
mechanism of choice, then symlinked into _~/.local/share/gnome-
shell/extensions_  
  
**[Windows Alt Tab](https://extensions.gnome.org/extension/38/) **Makes alt-tab cycle through all open windows, rather than all open applications. This is really useful if you have a lot of terminal windows open.  
  
**[Status Only Icon](https://extensions.gnome.org/extension/40/) **Remove your name from the top panel. You know who you are, and you don't care to let strangers in the coffee shop find out.  
  
**[Frippery Shut Down Menu](https://extensions.gnome.org/extension/14/) **Replaces the suspend menu option shut down. Perfect for a workstation that is turned off at the end of the day.  
  
**Remove Accessibility Icon **_(Not available on extensions.gnome.org) _I think it's wonderful how prominent the accessibility icon is in Gnome 3. It should always be out and visible by default, but since I don't need it, I've removed it from my desktop.  
  
**[Frippery Bottom Panel](https://extensions.gnome.org/extension/3/) **A bottom panel with a list of open windows and workspaces. This is probably the first training wheel I'll drop, as the gnome-shell overview thingy gives a good view of my open windows and workspaces.  
  
[**Frippery Static Workspaces**](https://extensions.gnome.org/extension/12/)
Works in conjunction with the number of workspaces you set via the Frippery
Bottom Panel, to keep them open even if no windows are present on the
workspace. This extension is my favorite. I find it very disorienting when the
webbrowser on workspace one crashes, then all of a sudden my 9 terminals are
on workspace 2 instead of workspace 3. Then I spend the next 15 minutes
juggling windows to get everything back to the workspaces they belong on.
Previously I'd open a terminal on all workspaces, just so that if another
application crashed, the workspace would remain open.  
  
**Classic Multi-Monitor Support** gnome-shell's default multi-monitor support, where only your primary monitor has more than one workspace, and the content on the other monitors is always pinned in place, is not to my liking. You can get the _OG _multi-monitor style back by running:  

    
    
    gconftool-2 -s /desktop/gnome/shell/windows/workspaces_only_on_primary --type bool false

  
**Minimize/Maxmize Buttons** Useful with the Frippery Bottom Panel. Get them back by running:  

    
    
    gconftool-2 -s /desktop/gnome/shell/windows/button_layout --type string ":minimize,maximize,close"

  
**No IM Integration **This last item I _wish_ I had. I find the popup notifications on incoming instant messages to be very distracting and disrupting, yet I still want to leave my IM status as online. If anyone knows how I can keep using empathy for IM, and yet not have any IM integration in Gnome 3, please leave me a comment!

