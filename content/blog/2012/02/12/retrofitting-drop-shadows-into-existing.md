---
aliases: [/2012/02/retrofitting-drop-shadows-into-existing.html]
date: '2012-02-12T16:28:00.000-04:00'
lastmod: '2012-02-12T16:28:12.382-04:00'
slug: retrofitting-drop-shadows-into-existing
tags: [fedora, programming, xml, android, ui, java]
title: Retrofitting drop shadows into existing Android layouts
---

I had some UI elements in an [Android application I'm working
on](https://market.android.com/developer?pub=James+Bowes) that felt as if they
should be above (pushing out of the screen, rather than to the top of it) the
elements that followed them in the UI. A good way to indicate this is with a
drop shadow, similar to those on Android title bars or [Action
Bars](http://developer.android.com/design/patterns/actionbar.html). An
[existing method](http://www.anotherandroidblog.com/2011/06/29/drop-shadow-
linearlayout/) didn't work for me, as my UI is relying heavily on weights to
keep proper size ratios between the elements I wanted to add a drop shadow to,
and the element they would be casting a shadow on.  
  
  
Rather than hanging the shadow off the element that will be casting the shadow
with a [RelativeLayout](http://developer.android.com/reference/android/widget/
RelativeLayout.html), and throwing off the weights, I instead used a [FrameLay
out](http://developer.android.com/reference/android/widget/FrameLayout.html)
to overlay the shadow on top of where the shadow was cast:  
  
`layout/my_layout.xml  
  
    <LinearLayout  
        android:id="@+id/linearLayout1"  
        android:layout_width="match_parent"  
        android:layout_height="0dp"  
        android:layout_weight="1"  
        android:layout_gravity="top"  
        android:paddingBottom="2dp" >  
  
        <ca.repl.MyShadowCastingWidget  
            android:id="@+id/shadow_caster"  
            android:layout_width="wrap_content"  
            android:layout_height="match_parent" />  
  
        <ca.repl.MyOtherShadowCastingWidget  
            android:id="@+id/other_shadow_caster"  
            android:layout_width="wrap_content"  
            android:layout_height="match_parent" />   
    </LinearLayout>  
  
    <FrameLayout  
        android:id="@+id/relativeLayout1"  
        android:layout_width="match_parent"  
        android:layout_height="0dp"  
        android:layout_gravity="bottom"  
        android:layout_weight="2" >  
  
        <ca.repl.MyOtherWidget  
            android:id="@+id/other_widget"  
            android:layout_width="match_parent"  
            android:layout_height="match_parent" />  
  
        <View  
            android:layout_width="match_parent"  
            android:layout_height="4dip"  
            android:background="@drawable/drop_shadow" />  
    </FrameLayout>  
`  
  
ca.repl.MyOtherWidget will have a shadow cast over it. To maintain the
weights, I just moved all attrs off ca.repl.MyOtherWidget and onto the new
FrameLayout.  
  
For completeness, here's the drop shadow drawable:  
  
`drawable/drop_shadow.xml  
  
<?xml version="1.0" encoding="utf-8"?>  
<shape xmlns:android="http://schemas.android.com/apk/res/android">  
    <gradient  
        android:startColor="@color/drop_start"  
        android:endColor="@color/drop_end"  
        android:angle="270" >  
    </gradient>  
</shape>  
`  
And the two colors for the drawable. I used black for the color with alpha
channels. If you wanted to make the shadow more obvious you could forgo alpha
channels:  
  
`values/colors.xml  
  
<resources>  
    <color name="drop_start">#66000000</color>  
    <color name="drop_end">#00000000</color>  
</resources>  
`

