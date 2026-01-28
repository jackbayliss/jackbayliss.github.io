---
title: "Queue Facade assertPushedTimes  - Laravel v12.49.0"
showToc: false
date: 2026-01-28
tags: ['PHP', 'Laravel']
---

I'm fairly sure by this point Taylor Otwell is more than likely fed up with seeing my face, but it was him that said ["we must ship!"](https://www.youtube.com/shorts/eoxn7Jd571Q)
I'm continuing to commit and push PR's so-- this week covers [Laravel v12.49.0](https://github.com/laravel/framework/releases/tag/v12.49.0) - and as usual there's some funky additions!

This blog post is mainly to go over my additions, as well - I'm not Laravel News!


## Queue assertPushedTimes
Currently, when you want to assert a Job that's been pushed to the queue a certain amount of times, we do something like: 

```php
        Queue::assertPushed(SomeJob::class, 2);
```

But,the second parameter is typed as a callback, which makes it confusing for reviews or anyone that hasn't touched it for awhile

<img src="/images/assert-pushed.png" alt="assert pushed">

[I added assertPushedTimes](https://github.com/laravel/framework/pull/58511) so, we can now do the below - which reads more explicit!

```php
        Queue::assertPushedTimes(SomeJob::class, 2);
```
and as you can see, its typed properly so no confusion...

<img src="/images/assert-pushed-times.png" alt="assert pushed">


## Ignore deadlock on DatabaseLock release

[This one](https://github.com/laravel/framework/pull/58507) is quite niche, and I purely fixed it because it was annoying me at work. 

When you're running [Laravel Queues](https://laravel.com/docs/12.x/queues) we all know it plucks a job, and works it.
But, realistically.. when it gets to millions of jobs and double digits of workers, ideally you're meant to be using Redis by this point..💀 but, when you're running with the Database driver and some workers can work the same queue you get into very rare race conditions.

So TLDR is-- because we run multiple workers, sometimes the cache lock table would give concurrency errors because another worker had already cleared it up. If you look at the Laravel source code, they already catch these errors when pruning expired locks, so it's basically the same.

I didn't cover the previous release which was [12.48.0](https://github.com/laravel/framework/releases/tag/v12.48.0) as I didn't fancy boring everyone, but theres quite a few additions. 
If you use Laravel, or even want to make a PR I'd really recommend reading the changelogs as it may inspire you for more features 🫡

I'd also like to give a big shoutout to my boss, Wes. If it wasn't for the team or the work ethic I wouldn't be inspired or have the chance/time to even dig into some of the PR's I do. A lot of what we do work wise is dig into things, and do things "the right way" so a lot of the PR's come from pain points.