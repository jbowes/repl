---
aliases: [/2005/03/mac-users-have-pretty-websitse.html]
date: '2005-03-08T03:07:00.000-04:00'
lastmod: '2011-11-06T10:07:16.089-04:00'
slug: mac-users-have-pretty-websitse
tags: []
title: Mac users have pretty websitse
---

  
My, how the tables have turned. While
[Colin](http://www.cs.dal.ca/~bate/archive/796) was setting his sights on
gooey  
development on Sunday, I was playing with web application development.  
As I [mentioned](http://flame.cs.dal.ca/~bowes/blog.cgi/odeo.html) earlier,
I've been meaning to learn [RoR](http://www.rubyonrails.org), so I started
this past weekend.  

  
  

  
I'm not going to comment on the poster child of Dal CS web  
development, [PHP](http://www.php.net), because I'm certainly not in touch
with the bleeding  
edge in that area. I will, however, say some things about RoR that really  
impressed me. Comparing and contrasting to language/framework X is  
left as an exercise for the reader.  

  
  

Cool thing #1: RoR provides scripts for creating a new  
application, and for creating new models and controllers (RoR is  
heavily MVC-based). So, running  
` rails app_name `  
will  
give you a new directory, app_name, filled with a nice directory  
hierarchy (including doc and test dirs), supporting classes, scripts, and  
some basic templates which you can then fill in. Similarly,  
` scripts/generate model foo_model `  
run from the base application directory will generate a class file for the  
foo_model model, and supporting test and doc files.  

  
  

  
Cool thing #2: After your create your database tables, you never  
have to write SQL again. RoR will automatically associate the  
foo_model class with the foo_models table in your DB. Calling `  
Foo_model.find(id) ` will return an instance of foo_model with  
values from the appropriate row in your DB. Additionally, RoR does the  
dirty work of associating table columns with class attributes. You  
never have to say that there is a foo_model.id varaible; RoR will  
automagically get that from the database.  

  
  

  
Cool thing #3: Controllers and views are dead simple, at least for prototyping
during development. To associate a controller with a model, you add  
` model :foo_model`  
to the controller class.  
Then, to add views and controller actions for basic operations like add, edit,
list, new, etc, you add  
`scaffold :foo_model`  
and that's it. no mucking about with html, or even Ruby, and you can add
items, modify existing ones, delete them, via your web browser in your fancy
new web app.  

  
  

  
Cool thing #4: Composition. if a foo_model is composed of (among other
things), many bar_models, then adding (in your preferred varient of SQL)  
` foo_model_id INTEGER NOT NULL `  
to the bar_model DB table,  
` has_many :bar_models `  
to the foo_model class, and  
` belongs_to :foo_model `  
to the bar_model class will create this relationship.  
Then, if you have an instance of foo_model, instance_name.bar_models is a list
of all the bar_models belonging to your foo_model. New bar_models can be
associated with the foo_model in standard Ruby ways to access lists
(list_name.push, for example), and this will automatically be updated in the
database.  

  
  

  
Needless to say, I'm pretty impressed with the Rails framework.  

