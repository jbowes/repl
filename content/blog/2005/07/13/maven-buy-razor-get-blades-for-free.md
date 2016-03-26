---
aliases: [/2005/07/maven-buy-razor-get-blades-for-free.html]
date: '2005-07-13T15:05:00.000-03:00'
lastmod: '2011-11-28T17:27:52.941-04:00'
slug: maven-buy-razor-get-blades-for-free
tags: [fedora]
title: 'Maven: buy the razor, get the blades for free'
---

  
Build tools are tricky things. Make and Ant lack key features for  
larger projects, like dependency resolution. The GNU autotools add  
more power to make, at the cost of extreme complexity.  

  
  

  
Project structure (e.g. directory layout) . Do you leave all your  
source files in the root directory, or create sub-directories? How do  
you divide the files into the directories? All of these combinations  
require a more powerful (and therefore more complex) build tool.  

  
  

  
The common solution, especially in the auto* world, is just to  
copy an existing project, empty the directories, and cut and paste the  
build files until the project works. Often, this results in cruft in  
the build files, though no-one knows it, because no-one can understand  
the auto* syntax.  

  
  

[Maven](http://maven.apache.org) turns the whole thing  
on it's head. The developer is given far fewer choices when setting up  
a project, in fact, some restrictions are imposed; a maven project  
must follow a some standards, such as directory layout. With the  
burden of choice taken off the developer, the knowledge that would  
have come from these choices is already inherent in the system, and so  
it does not have to be provided (through verbose config files) to Maven.

  
  

  
With a small config file, Maven can build a project, update the  
source from a CVS or SVN repository, download any libraries that the  
project depends on, run tests, generate documentation, build a project  
website, create eclipse project and classpath files (you can automate  
the process, instead of manually following two pages of instructions),  
and chart more data than you'll know what do to with. All of this is  
done through plugins, and most plugins themselves require no  
configuration beyond maven's base config file.  

