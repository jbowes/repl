---
aliases: [/2012/03/using-roboto-on-fedora.html]
date: '2012-03-17T19:43:00.002-03:00'
lastmod: '2012-03-18T08:09:02.750-03:00'
slug: using-roboto-on-fedora
tags: [fedora, android]
title: Using Roboto on Fedora
---

Using [Android](http://www.android.com/)'s
[Roboto](http://en.wikipedia.org/wiki/Roboto) font is pretty easy on
[Fedora](http://fedoraproject.org/) (or any other Linux flavour). Just
download the Roboto zip, open it up, copy the ttf files into your ~/.fonts
dir, and refresh your font cache. From there, you can use the font in any
program (though you may need to reload it first).  
  
Here are the steps:  
``  

    
    
    wget https://dl-ssl.google.com/android/design/Roboto_Hinted_20111129.zip  
    unzip Roboto_Hinted_20111129.zip  
    mkdir ~/.fonts  
    mv Roboto_Hinted_20111129/*.ttf ~/.fonts  
    fc-cache  
    

``

