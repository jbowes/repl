---
aliases: [/2008/05/graphing-git-repository-activity-in.html]
date: '2008-05-24T08:15:00.000-03:00'
lastmod: '2011-11-28T17:27:52.571-04:00'
slug: graphing-git-repository-activity-in
tags: [fedora, SCM, graph, perl, ascii, git]
title: Graphing Git Repository Activity In ASCII
---

[Here's a quick little script](http://jbowes.dangerouslyinc.com/wp-
content/uploads/2008/05/git-graph.pl) I wrote up (adapted from [this perlmonks
post](http://www.perlmonks.org/?node_id=336907)) to show
[git](http://git.or.cz) repository activity as an ascii graph, like so:  

  
  
![git-graph screenshot](http://jbowes.files.wordpress.com/2008/05/screenshot-
git-graphpl.png)The X axis represents a day, with the current day being on the
far right. The Y axis is no. of lines added + no. of lines deleted during that
day.  
  
**EDIT (2009/02/03):**  
  
Wordpress.com won't let me attach a .pl file, so here's the contents:  

    
    
    #!/usr/bin/perl  
    #  
    # git-graph.pl - Generate an ascii graph of git repository activity  
    #  
    # Copyright (C) 2008 James Bowes <jbowes@dangerouslyinc.com>  
    #  
    # Graphing routine Adapted from http://www.perlmonks.org/?node_id=336907  
      
    sub get_activity {  
        my $day = shift;  
        my $git_cmd = 'git diff --shortstat "@{' . ($day + 1) .' day ago}" "@{' .  
                      ($day or "0") . ' day ago}"';  
        $res = `$git_cmd 2> /dev/null`;  
      
        $res =~ /, (.*?) insertions\(\+\), (.*?) deletions\(-\)/;  
        $activity = $1 + $2;  
      
        return $activity;  
    }  
      
    @deltas = ();  
    foreach $day (0..70) {  
        push (@deltas, get_activity ($day));  
    }  
      
    print ("\n");  
    print graph(@deltas);  
    print ("\n");  
      
    sub graph {  
      my( $i, $magic, $m, $p, $top, @g ) = ( 0, 20, 7, 70, 0, () );  
      
      foreach $pad (0..($p - scalar(@_))) {  
          push (@_, 0);  
      }  
      
      @_ = reverse @_;   
      
      for (0..($p)) {  
          $top = ($top > $_[$_]) ? $top : $_[$_];  
      }  
      
      $top = $top - ($top % 100) + 100;  
      
      my $s = $top > $magic ? ( $top / $magic ) : 1;  ### calculate scale  
      
      for (0..$magic) {  
        $g[$_] = sprintf("%" . ($m - 1) . "d |", $_ * $s) .  
                 ($_ % 5 == 0 ? '_' : ' ') x ($p);  
        for $i (0..($p)) {  
            substr($g[$_], ($i + $m), 1) = '#' if ($_[$i] / $s) > $_;  
        }  
      }  
      join( "\n", reverse( @g ), ' Date:  ' . '^^^^^^|' x ( $p / 7 ));    
    }  # end sub graph  
      
    __END__

