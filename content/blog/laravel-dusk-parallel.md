---
title: "Parallel Laravel Dusk Tests"
showToc: false
date: 2026-03-04
tags: ['PHP', 'Laravel', 'Dusk']
---

If you've ever used Dusk, you know the following:
- It can sometimes be flaky for no reason
- Even a relatively small test suite takes time, because it uses a real driver in the background


The above was a real thing that happened and mainly because of work, I decided to give it a good poke and so the [laravel dusk parallel](https://github.com/jackbayliss/laravel-dusk-parallel) package was born

Essentially, all you have to do it require the package, and run a few extra chromedriver instances (sorry, I haven't tested any other drivers!)

Then, you can bring a 3-minute test suite to 1:45m (A nice half speed increase) ! I've even made a [demo](https://github.com/jackbayliss/dusk-parallel-demo) you can view in terms of the CI setup, and the tests etc.

Why do it this way? 

I'll level with you, for open source, it probably doesn't matter, actions are free so who cares if it takes 15 minutes.
But, for private repos every minute matters so the normal way that exists in the world is to just split the tests between action runners, but this also increases the cost.

This way means its one instance running multiple drivers, which means no increase in cost!

I also kinda wanted to try an idea and it seems so far to work quite well!


There's a few things I had to tackle that I'll briefly explain below:
1) Ensuring the tests actually run in parallel
This wasn't too bad, there's a package called `brianium/paratest`, which Laravel also uses under the hood which allows us to run parallel testing. The Dusk source code has a binary method, which means we can override it to tell it to use paratest essentially.
2) Ensuring the page being tested uses the correct test database
This was probably the biggest hurdle, because when the page is hit, it's loaded from apache etc, which means it's using the default database normally. What I came up with was essentially having middleware that when the page is being tested in parallel it switches the page to the database the worker is using, therefore there's no stale data.