---
aliases: [/2012/12/squeezebox-server-fedora.html]
date: '2012-12-16T19:33:00.001-04:00'
lastmod: '2012-12-16T19:33:12.143-04:00'
slug: squeezebox-server-fedora
tags: [tech, fedora]
title: Squeezebox Server & Fedora
---

  
To get squeezeboxserver working on Fedora, add the following to
_/etc/sysconfig/iptables_:  
  

    
    
    # squeezebox  
    -A INPUT -m state --state NEW -m tcp -p tcp --dport 9000 -j ACCEPT  
    -A INPUT -m state --state NEW -m tcp -p tcp --dport 3483 -j ACCEPT  
    -A INPUT -m state --state NEW -m udp -p udp --dport 3483 -j ACCEPT  
    

  

