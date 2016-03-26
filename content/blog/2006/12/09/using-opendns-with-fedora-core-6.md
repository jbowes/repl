---
aliases: [/2006/12/using-opendns-with-fedora-core-6.html]
date: '2006-12-09T10:11:00.000-04:00'
lastmod: '2011-11-28T17:27:52.962-04:00'
slug: using-opendns-with-fedora-core-6
tags: [tech, fedora, config files]
title: Using OpenDNS with Fedora Core 6
---

DNS lookups at home were extremely slow for me. For instance, while doing some
profiling of [yum](http://linux.duke.edu/projects/yum/) this afternoon, 10 out
of 15 seconds were taken up resolving the IP of download.fedora.redhat.com.
Replacing[ Road Runner's](http://www.rr.com) DNS servers with[
OpenDNS](http://www.opendns.com) took this down to 5 seconds. Putting OpenDNS
before my router's DNS server makes the time negligible.  
  
Anyways, the details:  

  

  * Copy /usr/share/doc/dhclient-$VERSION/dhclient.conf.sample to /etc/dhclient.conf
  

  * Edit /etc/dhclient, removing everything before the 'prepend domain-name...' line, and everything after the 'initial-interval 2;' line.
  

  * On the 'prepend domain-name-servers' line, replace '127.0.0.1' with  
'208.67.222.222 208.67.220.220'.

  

  * Take down and bring back up your network connection. /etc/resolv.conf should now start with the two 208... IP addresses.
  
  
The important part I believe is to keep the 'request' and 'require' bits in
dhclient.conf. This setup will play nicely with[
NetworkManager](http://www.gnome.org/projects/NetworkManager/), too. Mad props
to Orangebat for pointing out OpenDNS.  
  
Here's a sample dhclient.conf, to make it easy:  

    
    
      
    prepend domain-name-servers 208.67.222.222, 208.67.220.220;  
    request subnet-mask, broadcast-address, time-offset, routers,  
            domain-name, domain-name-servers, host-name;  
    require subnet-mask, domain-name-servers;  
    timeout 60;  
    retry 60;  
    reboot 10;  
    select-timeout 5;  
    initial-interval 2;

