---
aliases: [/2009/06/converting-svn-commits-to-git-patches.html]
date: '2009-06-23T03:29:00.000-03:00'
lastmod: '2011-11-28T17:27:52.799-04:00'
slug: converting-svn-commits-to-git-patches
tags: [tech, fedora, SCM]
title: Converting SVN Commits to Git Patches
---

In case you find yourself in need of a way to turn an svn revision into a git
patch that can be applied with 'git am', keeping the commit message and
authorship information, here's a script I used recently:  

    
    
    #!/usr/bin/python  
    #  
    # svnrev2git.py - Convert an SVN revsion to a Git patch.  
    #  
    # Author: James Bowes <jbowes@repl.ca>  
    #  
    # Usage:  
    #   $> cd my-svn-repo  
    #   $> python svnrev2git.py [AUTHORS_FILE] [REV_RANGE | REVSION [REVISION..]]  
    #  
    #   AUTHORS_FILE - a CSV of  svn username, full name, email  
    #   REV_RANGE - an svn revision range, like 100-700  
    #   REVISION - a single svn revision  
    #  
    #   You may specify either a revision range, or a series of individual  
    #   svn revisions  
    #  
    # Output:  
    #   A series of git style patch files, one per svn revision, which can then be  
    #   applied with 'git am'  
    #  
    # Why use this instead of 'git svn'?  
    #   I had done a large repo conversion via git svn where we wanted no downtime  
    #   for the switchover. After removing the git svn specific info from our git  
    #   commits, I used this tool to bring in commits from svn, keeping svn and git  
    #   in sync, until we were ready to switch.  
      
    import sys  
    import commands  
      
    def svnlog_to_gitlog(authors, svnlog):  
      
        lines = svnlog.split("\n")  
        lines = lines[1:-1]  
      
        metainfo = lines[0].split(" | ")  
        subject = lines[2]  
        description = lines[3:]  
      
        author = metainfo[1]  
      
        day = metainfo[2].split("(")[1][:-1]  
        time = metainfo[2].split(" ")[1]  
        offset = metainfo[2].split(" ")[2]  
      
        gitlog = []  
        gitlog += ["From: %s <%s>" % authors[author]]  
        gitlog += ["Date: %s %s %s" % (day, time, offset)]  
        gitlog += ["Subject: [PATCH] %s" % subject]  
        gitlog += [""]  
        gitlog += description  
        gitlog += [""]  
      
        return '\n'.join(gitlog)  
      
    def svndiff_to_gitdiff(svndiff):  
        lines = svndiff.split("\n")  
      
        gitdiff = []  
        for line in lines:  
            if line.startswith("--- "):  
                gitdiff.append("--- a/" + line[4:])  
            elif line.startswith("+++ "):  
                gitdiff.append("+++ b/" + line[4:])  
            else:  
                gitdiff.append(line)  
      
        return '\n'.join(gitdiff)  
      
    def make_patch(authors, rev):  
        out = commands.getoutput("svn log -c %s ." % rev)  
      
        if len(out.split("\n")) < 2:  
            print "skipping r%s" % rev  
            return  
      
        patch = open(rev + ".patch", 'w')  
        patch.write(svnlog_to_gitlog(authors, out))  
        patch.write("---\n\n")  
      
        out = commands.getoutput("svn diff -c %s ." % rev)  
        patch.write(svndiff_to_gitdiff(out))  
      
        patch.write("\n---\n")  
        patch.write("svnrev2git.py\n")  
      
        patch.close()  
        print "wrote %s.patch" % rev  
      
    def main(args):  
        author_file = open(args[0])  
        authors = {}  
      
        print "loading authors"  
        for line in author_file.readlines():  
            parts = line.strip().split(", ")  
            authors[parts[0]] = (parts[1], parts[2])  
      
        author_file.close()  
      
        revs = args[1:]  
      
        if len(revs) == 1 and '-' in revs[0]:  
            start, end = revs[0].split('-')  
            start = int(start)  
            end = int(end)  
            revs = [str(x) for x in range(start, end + 1)]  
      
        for rev in revs:  
            make_patch(authors, rev)  
      
    if __name__ == "__main__":  
        main(sys.argv[1:])

