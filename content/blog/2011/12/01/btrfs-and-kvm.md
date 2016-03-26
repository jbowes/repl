---
aliases: [/2011/11/btrfs-and-kvm.html]
date: '2011-11-30T22:06:00.001-04:00'
lastmod: '2011-11-30T22:15:26.300-04:00'
slug: btrfs-and-kvm
tags: [tech, fedora, virtualization]
title: BTRFS and KVM
---

If you're like me, you've spend the last year wondering why your KVM based
virtualization is horribly slow when doing IO. You've tried twiddling every
available option in your BIOS, you've mucked about with hdparm  and
libvirt/qemu settings, and you've run more timed installs of [RHEL
5](http://www.redhat.com/rhel/) than you care to admit.  
  
If you're also like me, you tried using ext4 instead of BTRFS to store your
guest images today, and found that this resolved your issue.  
  
The relevant bz appears to be
[here](https://bugzilla.redhat.com/show_bug.cgi?id=689127).  
  
The lesson I learned today is to blame experimental or newer features before
anything else (though its doubtful I'll remember this next time).

