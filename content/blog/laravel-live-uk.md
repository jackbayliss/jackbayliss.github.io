---
title: "Laravel Live London 2026"
showToc: false
date: "2026-06-25"
tags: ['PHP', 'Laravel', 'Laravel Live']
description: "Laravel Live London 2026."
---

So, last week I got the glory of attending my second Laravel event, this one being Laravel Live UK. 
It was cool seeing all the familiar faces of internet folk!  there were many interesting talks, most highlighting static analysis and rector, which I'm happy to report at my company we're ahead of the curve. 

## Talks 

There were many cool talks, so I won't go over each one, but I'll give a d-low of some cool talks.

Harris Raftopoulos did an epic talk on value objects which maybe we should adopt more of, while Ryan Chandler did a talk around optimising workflows such as fakes, and feature flags. Luckily, my current company use feature flags heavily, ie unless its a straight forward change its always flagged. We don't use Pennat, though we do roll our own features config which works well. One thing about Ryans talk was the use of services, fakes and Facades. I think we could probably do with using something of the sort at my current company, though we don't use many external services, so could be slightly overkill? To be explored I guess. 

Another great talk was Wendell Adriel's, which was about metaprogramming, ie php's magic methods that give us as users a better experience. This was probably my favourite (not because it was Wendell) but because it explored some real stuff Laravel does, such as `__callStatic`... Facades  use this, such as `Class::method()` to access the instance's methods which means, us as an end user, get to call a method as if it was static. I liked is cos it was a bit of a deep dive on Laravels internals. I kinda find it mad Taylor wrote the framework like 15 years ago with so much thought, not to be a fan boy, but its cool eh.

There was a lot of talk around AI, but my opinion of AI is use it like Google... but don't lose your brain!

## Actually meeting people

I've been pretty anti-social this year tbh, and going to this conference made me realise, maybe I really should be doing more Laravel conferences. I was also kinda surprised how many people recognized my face. I don't consider myself to be a good programmer, but I'm pretty good at finding gaps. So, that was a bit of a eye-opener. Always the TLDR is I got to meet a bunch of the community, laravel staff and more importantly catch up in REAL LIFE with my team.  

We've been working really hard this year, we've probably made the most changes the code base has seen in years pretty smoothly (in terms of big pieces) we've had a lot of moving parts and somehow, it was mostly pain free. (Shout out to Sam)  

All the Laravel staff and everyone were really easy going and cool to talk with, I didn't feel like anyone had an ego, so very nice folks! 

I did also get to attend their VIP event, mainly cos we're going to be / are using Laravel Cloud, so that was also pretty cool..



## Takeaways
- Keep working hard
- Maybe try to implement phpstan? (Our code base is like 13 or so years old, so its painful)
- Keep relying on Rector to keep CS standards, pint as well
- Try to do more events this year, once I get rid of the electric car (I am a mere English man)
- Side thought, how do people afford to go to all these conferences?! I guess realistically people only go to so many a year? like 1/2?