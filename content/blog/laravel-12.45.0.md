---
title: "Enums - Enums - Enums - Laravel v12.45"
showToc: true
date: 2026-01-06
tags: ['PHP', 'Laravel', 'Enums', 'Queue']
aliases:
  - /blog/laravel-12.45-enums
description: "Laravel v12.45.0 adds native enum support to the Storage, Cache, and Session facades, plus new QueuePaused and QueueResumed events for the queue:pause and queue:resume commands."
---

With the release of [Laravel v12.45.0](https://github.com/laravel/framework/releases/tag/v12.45.0) it's all about enums! 

## Loads of methods now accept enums!
A lot of methods now accept enums, which I think is pretty cool.
I did however have a helping hand, so I'm a bit biased
- [Persistent Cache](https://github.com/laravel/framework/pull/58287)
- [Cache Facade](https://github.com/laravel/framework/pull/58246)
- [Queue Paused / Resumed Events](https://github.com/laravel/framework/pull/58202)

The below all have methods that now accept enums, or all of their methods do! 

This means we can easily change the enum value without having to slug through tests etc.

### Storage Facade

> [What is the Storage Facade](https://laravel.com/docs/12.x/filesystem#obtaining-disk-instances)

```php
enum StorageDisk: string
{
    case Test = 'test';
}

// Before...

// Allowed string
Storage::fake('test');
// Or, you had to get the ->value if using an enum
Storage::fake(StorageDisk::Test->value)

// Same for the `persistentFake` method...
Storage::persistentFake(StorageDisk::Test->value)

// Now...
Storage::fake(StorageDisk::Test)
Storage::persistentFake(StorageDisk::Test)
```

### Cache & Session Facade

> [What is the Cache facade](https://laravel.com/docs/12.x/cache#obtaining-a-cache-instance)
> 
> [What is the Session facade](https://laravel.com/docs/12.x/session#the-global-session-helper)

```php

enum Deployment: string
{
    case Started = 'started';
}

// Before...

// Allowed string
Cache::put('test', 1);
// Or, you had to get the ->value
Cache::get(Deployment::Started->value)
 
 
// Now...
Cache::put(Deployment::Started, 1)
Cache::get(Deployment::Started)
Cache::rememberForever(Deployment::Started, fn() => 'This is pretty cool huh?!')


// Same for the Session facade
Session::put(Deployment::Started, 1);
Session::get(Deployment::Started);
```

# What else is new?

I would recommend reading the [changelogs](https://github.com/laravel/framework/releases/tag/v12.45.0), as there's ALWAYS something new..
But, as one more shameless plug I added the `QueuePaused` and `QueueResumed` events so when using the `queue:pause`, or `queue:resum`e commands the events will be dispatched which means you can subscribe to them and do what you want logic wise ie Slack notifications etc.


# What's cooking?

Call me a chef, I got 2 PR's in the 13.x pipeline: 
- [Ability to set the job queue based on class type](https://github.com/laravel/framework/pull/58094)
- [Prevent Queue Worker crash is cache store is unavailable](https://github.com/laravel/framework/pull/57257)
