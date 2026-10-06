---
title: "Moving to Laravel Cloud, and the magic of the Cloud Facade"
showToc: true
date: 2026-10-06
tags: ['PHP', 'Laravel', 'Laravel Cloud', 'Queue']
description: "Moving our app over to Laravel Cloud, and how the Cloud facade and Queue::forward() make queues just work in production."
---

> ⚠️ **Note:** You'll need **Laravel v13.32.0 and above** for everything below.

So, for the past few months I've been the one responsible for moving us over to [Laravel Cloud](https://cloud.laravel.com). I mentioned in my [Laravel Live post](/blog/laravel-live-uk/) it was on the cards and well.. it's happened!

I'm not gonna lie though, it's been a LOT of work, but I've really enjoyed owning it start to finish. Our code base is 13+ years old, there's a lot going on, and every time I hit something that didn't quite fit I'd end up in the framework source code.. which usually ended in a PR 😅 Since April I've had something like 60 PRs merged into Laravel around queues and Cloud. The facade, `Queue::forward()`, worker events, pausing, queue sizes etc. Some tiny, some not so tiny.

The upside of all that is the Cloud side of things is now pretty painless. A lot of that is because Laravel does most of the work for you. If you have a poke around the framework there's a `CloudBootstrapper` class, and when your app boots on Cloud it sets up your disks, database pooling, read replicas, logging, exceptions and the queue connection without you touching any config.


## The Cloud facade

Queues are one of the important thinkgs to think about, at least for us.

Locally you're probably using the database or redis driver for queues, but on Cloud you get "managed queues" which live on a `cloud` connection. So there's a few places where you need to know if you're on Cloud, and if a queue is managed or not. I was originally digging through config to work that out and it felt funky, so I [PR'd a Cloud facade](https://github.com/laravel/framework/pull/61275) which helped us greatly, and hopefully helps you too!

```php
use Illuminate\Support\Facades\Cloud;

Cloud::hosted();                  // Are we on Laravel Cloud?
Cloud::usesManagedQueues();       // Is the cloud queue connection set up?
Cloud::queue();                   // The managed queue connection
Cloud::isManagedQueue('emails');  // Is this queue managed by Cloud?

Cloud::queue()->managedQueues();  // ['emails', 'podcasts', ...]
Cloud::queue()->size('emails');
Cloud::queue()->totalSize();      // Every managed queue added up
```

The one I use the most is `isManagedQueue()`, locally its always false so you can write the code once and not worry about it.

## Forwarding queues

There's a couple of reasons you'd want this.

First, if you're like us and running a mix ie some queues on managed queues and the rest still on database/redis (while you move things over, or because you want to) then `cloud` isn't your default connection. So jobs on queues like `emails` and `podcasts` need sending to the `cloud` connection, and everything else stays where it is. You could add `onConnection('cloud')` to every job.. but that's a lot of jobs 💀

Second, names. Managed FIFO queues end in `.fifo`, so you might have `podcasts` locally but `podcasts.fifo` on Cloud. Even if all your queues are managed, you still need something to map one to the other.

So I [added `Queue::forward()`](https://github.com/laravel/framework/pull/61188) which lets you send a queue to a different queue and/or connection:

```php
use Illuminate\Support\Facades\Queue;

Queue::forward('reports', connection: 'cloud');

// You can rename it too, handy for fifo queues...
Queue::forward('podcasts', 'podcasts.fifo', 'cloud');

// Or a load at once
Queue::forward([
    'reports' => 'audit',
    'emails' => 'mail',
], connection: 'cloud');
```

## The magic bit

Now if you mix the two together, you can forward only the queues Cloud actually manages, and leave your default connection to handle the rest. Chuck this in your `AppServiceProvider`:

```php
use Illuminate\Support\Facades\Cloud;
use Illuminate\Support\Facades\Queue;

public function boot(): void
{
    if (Cloud::usesManagedQueues()) {
        foreach (Cloud::queue()->managedQueues() as $queue) {
            Queue::forward($queue, connection: 'cloud');
        }
    }
}
```

Locally nothing changes. On Cloud anything managed goes to the `cloud` connection and anything you haven't set up yet just carries on like normal. That was a big one for us, as we could move queues over one by one rather than all at once and hoping for the best.

You can also do it per queue with `isManagedQueue()`, or per class with `Queue::route()`:

```php
if (Cloud::isManagedQueue('podcasts')) {
    Queue::forward('podcasts', connection: 'cloud');
}

Queue::route(ProcessPodcast::class, queue: 'podcasts', connection: Cloud::isManagedQueue('podcasts') ? 'cloud' : null);
```

One thing to note, forwarding goes off the queue name so if your job doesn't have one (ie no `onQueue()` or `#[Queue]`) it won't get forwarded. And if the job sets `onConnection()` itself, that wins.

The `CloudManager` is macroable as well so you can wrap any of this up in your own `Cloud::` method if you fancy.

## Gotchas

`queue:pause` doesn't work on managed workers. Cloud turns off the pause and restart polling (I wrote about that [here](/blog/improve-laravel-queue-speed/)) because it looks after the workers itself. If you still need to pause, you can listen for the `Looping` event and return false:

```php
use Illuminate\Queue\Events\Looping;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Queue;

Event::listen(function (Looping $event) {
    if (Queue::isPaused($event->connectionName, $event->queue)) {
        return false;
    }
});
```

Also keep an eye on `--memory` for `queue:work`, it defaults to 128MB no matter how big your container is, so workers can end up restarting way more than they need to. Annoyingly Cloud doesn't let you pass flags to the managed workers, so you can't just bump it.. you'll have to extend the `WorkCommand` and set the memory yourself, which is a bit meh.

And if you show queue sizes anywhere, make sure you're checking the `cloud` connection, otherwise you'll be looking at 0 wondering where everything went. The totals are handy for that:

```php
Log::info('Queue sizes', [
    'pending' => Cloud::queue()->totalPendingSize(),
    'delayed' => Cloud::queue()->totalDelayedSize(),
]);
```

TLDR, if you're on the fence about Laravel Cloud.. just do it. Being able to not worry about servers, being able to scale up and down is great, being able to just focus on the app is massive, and with everything that's been added to the framework recently, it really does just work.

That's all for now folks! Oh, and I also moved us from a generic MySQL provider over to PlanetScale.. but that's a blog post for another day 👀
