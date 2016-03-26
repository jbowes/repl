---
aliases: [/2007/01/new-hosting.html]
date: '2007-01-23T13:06:00.000-04:00'
lastmod: '2011-11-28T17:27:52.915-04:00'
slug: new-hosting
tags: [wordpress, tech, dangerously_incompetent, fedora, apache_configuration, life,
  python, cgi_program, blog, php]
title: New hosting
---

I’ve moved my blog and associated pages from [Dal CS](http://www.cs.dal.ca) to
the [dangerously incompetent](http://www.dangerouslyinc.com) data center.
Also, I’ve moved it from pybloxsom to [wordpress](http://www.wordpress.org),
mainly because of what [Marc](http://www.lastblogger.com) has written about
it. So far I’m very impressed.  
  
The most difficult thing has been setting up redirects from my old cs pages to
these new ones, due to the apache configuration at Dal. I’ve had to do silly
things like making a directory called “cv.html”, and placing an index.php file
in there that will write out redirect headers. I also had to write up a quick
python cgi program that translates requests for old blog posts into redirects
to their locations on my new blog. Good times.

