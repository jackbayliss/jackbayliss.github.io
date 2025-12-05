---
title: "Improve Laravel Queue Speed"
showToc: false
date: 2025-12-03
tags: ['PHP', 'Laravel']
---

I recently discovered our Workers seemed to be hitting the database **far** too frequently. After digging into the `Worker` class, I figured out that it was down to the *restart* and *pause* polling that happens on each loop.

I knew we could override `CacheManager` to change this behavior, but that felt… funky. It wasn’t obvious to developers, and it wasn’t really documented anywhere. So — I thought I’d [open a PR](https://github.com/laravel/framework/pull/57975), and luckily for me, it was accepted! 🎉


## Why Laravel Workers Poll the Cache

Every time a queue worker checks for a job, it also checks for:

- A signal to **restart**
- A signal to **pause**

This is because you can use the `queue:restart` command to force restart all the queue workers, or the `queue:pause` command to pause individual queues.

The pause and restart signals are dictated by the Cache driver, which in my case is the Database. Redis is much quicker
at handling this, but to save the extra hits - this could also be useful for you regardless of driver.

## How to Reduce (or Remove) Polling

Depending on your workflow, there are now two approaches typically these are added into the `AppServiceProvider`

### Disable Interruption Polling Completely

If you never use `queue:pause` or `queue:restart`, then you're spending resources checking for features you don’t actually need. By disabling interruption polling entirely, your workers skip those cache lookups.

```php
use Illuminate\Support\Facades\Queue;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Queue::withoutInterruptionPolling();
}
```

### Disable Restart / Pause Independently

If you only need *one* of these features such as, allowing workers to restart but not pausing **you don’t** have to disable both. Laravel exposes each behavior as its own static property, so you can turn each on or off, depending on what your application needs.

```php
use Illuminate\Queue\Worker;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Worker::$restartable = false;
    Worker::$pausable = false;
}
```

That's all for now folks!