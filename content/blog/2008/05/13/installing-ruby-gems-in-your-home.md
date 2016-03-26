---
aliases: [/2008/05/installing-ruby-gems-in-your-home.html]
date: '2008-05-13T07:54:00.000-03:00'
lastmod: '2011-11-28T17:27:52.402-04:00'
slug: installing-ruby-gems-in-your-home
tags: [gems, fedora, ruby, config, config files]
title: Installing ruby gems in your home directory
---

I found it hard to find good instructions for installing ruby gems as a non-
root user without installing the gem package locally as well. Here's what I
figured out; hopefully this will save someone else some time in the future:  
  
Make a directory for gem installation:  
  
`$> mkdir ~/.gems`  
  
Set up your .gemrc for gem install-time configuration:  
  
`$> cat << EOF > ~/.gemrc  
gemhome: $HOME/gems  
gempath:  
- $HOME/gems  
- /usr/lib/ruby/gems/1.8  
EOF`  
  
Set up some environment variables for run-time:  
  
`$> cat << EOF >> ~/.bashrc  
export GEM_HOME=$HOME/gems  
export GEM_PATH=$HOME/gems:/usr/lib/ruby/gems/1.8/  
export PATH=$PATH:$HOME/gems/bin  
EOF`  
  
Source your bashrc and you're all set.  
  
**UPDATE (Apr 18, 2009):** gem seems to do this on its own now, so just adding  

    
    
    export PATH=$PATH:$HOME/.gem/ruby/1.8/bin

  
to your .bash_profile should be enough.

