---
aliases: [/2005/06/university-unlearning-optimization.html]
date: '2005-06-28T12:45:00.000-03:00'
lastmod: '2011-11-28T17:27:52.554-04:00'
slug: university-unlearning-optimization
tags: [fedora]
title: 'University Unlearning: Optimization'
---

  
Many professors would encourage students to try and write the fastest
executing program for a given assignment, possibly awarding bonus points to
whoever won.  
During class, they would point out ways to decrease execution time, or
decrease memory usage. Such pearls of wisdom included "passing function
parameters as bit vectors will save on memory usage", and the ever-popular
"right shifting an integer is equivalent to dividing by two, only faster!"

  
  
  
  
[![under repairs](http://photos15.flickr.com/21988047_b87da7686f_m.jpg)](http:
//www.flickr.com/photos/bowes/21988047/ "Photo Sharing" )  
_If it ain't broke..._  
  
  

  
There was one thing, however, that I never heard: optimization is **bad**.  

  
  

  
Optimization hurts code and kittens. If a programmer starts  
optimizing before the program is complete, they're going to spend  
extra time working on the optimized version of something that may not  
even need to be optimized, and slow down the coding of the entire  
program.  

  
  

  
Each time you optimize a piece of code, you are saying "I am  
smarter than everyone who has worked on the compiler I am about to  
use." `gcc` can perform strength reductions, loop unrolling, moving  
constants out of loops, and more. Anything you try is probably already  
being done, so you better take measurements to make sure you're  
improving performance, if you do optimize.

  
  

  
Optimization hurts readability, too. `void makeCake (char *options);` is far
less readable than `void makeCake (boolean useFrosting, boolean
useSprinkles);`. Even that cute little  
right-shift is one more conceptual hurdle to jump over.  

  
  
  

>  
Jackson's rules of Optimization:  
  

>

>  

>   1. Don't do it.

>  

>   2. (For experts only) Don't do it yet - that is until you have a perfectly
clear and unoptimized solution.

>  
  
  

  
_A second-year computer science student is not an expert._  
  
  

  
I'm not sure what those professors were trying to prepare us students for,
because it certainly wasn't what is commonly known as 'reality'.  

