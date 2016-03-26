---
aliases: [/2007/05/using-hostip-berkeley-db-files-from.html]
date: '2007-05-10T09:02:00.000-03:00'
lastmod: '2011-11-28T17:27:53.115-04:00'
slug: using-hostip-berkeley-db-files-from
tags: [tech, dotted_quad, fedora, csv_file, aspn, python, bdb, ip_address]
title: Using Hostip Berkeley DB Files From Python
---

I needed to process some IP addresses the other day to associate them with
their originating Country. I implemented the code in [Python
](http://www.python.org)(as usual), and decided to try out
[Hostip](http://www.hostip.info) for the IP address to Country mappings.
Hostip provides freely downloadable bdb data files (along with a mysql db and
a CSV file). Using the bdb files isn't straightforward, so here is a general
recipe for consuming them:  

  

  * Download the bdb files from hostip. There are three files, _hip_ip4_country.db_ (maps IP to country id), _hip_countries.db_ (maps country id to country name), and _hip_ip4_city_lap_lng.db_ (maps IP to city location).
  

  * Open the files with Python. They're bdb btree format files, so I found it easiest to open them with _bsddb.btopen(FILENAME, 'r')_
  

  * Convert your IP address to the correct format. Hostip bdb entries are keyed on class C block addresses, in integer format. The following code should do it:  
  
`def dottedQuadToNum(ip):  
"convert decimal dotted quad string to long integer"  
return struct.unpack('!L',socket.inet_aton(ip))[0]  
ip = "255.255.255.255"  
ipparts = ip.split('.')  
ipparts = ipparts[:3]  
ipparts.append('0')  
cclass = '.'.join(ipparts)  
intcclass = dottedQuadToNum(cclass)`  
_dottedQuadToNum from from
[ASPN](http://aspn.activestate.com/ASPN/Cookbook/Python/Recipe/66517)._

  

  * Now, you can use the string representation of intcclass to get a country id from hip_ip4_counties.db, and use the id to get a country name from hip_countries.db
  

