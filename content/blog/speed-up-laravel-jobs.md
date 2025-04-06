---
title: "Speeding up Laravel Jobs"
showToc: false
date: 2025-04-06
tags: ['PHP', 'Laravel']
---

When going through the Laravel Queue documentation, I noticed a section around [Queued Relationships](https://laravel.com/docs/12.x/queues#handling-relationships) and the d-low is that essentially when you're sending a model to a Job, if your model has relationships loaded, those relationships will also get loaded into the payload of the job. This isn't always obvious!

For example, take the below Job as am example:

```php 
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class WelcomeEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public User $user)
    {
    }

    public function handle()
    {
        // Some sending logic here...
    }
}
```
Because we're expecting a User model its seralized, including the relations.


Well-- how does that actually work? So imagine if we had a bunch of code and the dispatch looked something like the below:

```php
// Essentially you could be using the user object within a page and loading other items into it, but then also using it to dispatch.
$user = User::with('profile')->where('id',X)->first(); 
// But, because we're dispatching it with relations, you'll get them included in the payload.
WelcomeEmailJob::dispatch($user);
```

The Laravel Job payload ends up looking something like the below (as a rough example):
```
{
  "O:30:\"App\\Jobs\\WelcomeEmailJob\":2:{
    s:16:\"\u0000*\u0000user\";O:45:\"App\\Models\\User\":4:{
      s:10:\"connection\";s:5:\"mysql\";
      s:5:\"table\";s:5:\"users\";
      s:2:\"id\";i:1;
      s:8:\"\u0000*\u0000relations\";a:1:{
        s:7:\"profile\";O:48:\"App\\Models\\Profile\":3:{
          s:10:\"connection\";s:5:\"mysql\";
          s:5:\"table\";s:8:\"profiles\";
          s:2:\"id\";i:1;
        }
      }
    }
  }
}
```

And, we can see there's there's relations included in the payload!

## So, what can we do to fix it?

If you're not explcitly using the relations in the Job you can either : 
Use the `#[WithoutRelations]` Attribute which looks like:

```php 
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\Attributes\WithoutRelations;

class WelcomeEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(#[WithoutRelations] public User $user)
    {
    }

    public function handle()
    {
        // Some sending logic here...
    }
}
```

Or, call the `withoutRelations` method from the model..
```php 
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\Attributes\WithoutRelations;

class WelcomeEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public User $user)
    {
        $this->user = $user->withoutRelations();
    }

    public function handle()
    {
        // Some sending logic here...
    }
}
```

## How does this help?

By reducing the payload, the queue is able to work through it faster as there's less data in the payload for it to deserialize etc. If you have bigger jobs, with more models etc- you can begin to see the benefit of ensuring relations aren't included. But, it's something to consider if you weren't aware about it!