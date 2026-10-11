---
title: "The importance of reading the laravel framework releases"
showToc: true
date: 2026-10-11
tags: ['PHP', 'Laravel', 'Releases', 'Career']
description: "The importance of reading the laravel framework releases."
---

One superpower that can really help your Laravel career, and with your application in general is reading the Laravel framework releases.

## Framework vs. skeleton

If you didn't know, the framework code is basically what your application runs on underneath, whereas the `laravel/laravel` repo is essentially the skeleton you use when creating a new application. Most of the good stuff lands in the framework, and you get it just by running `composer update`, so it's worth knowing what's actually in there.

## Where to look

You should keep an eye on the [framework releases](https://github.com/laravel/framework/releases). Now, why do you ask?

Every single release brings new features, and one of those features could be a real improvement for your application.

## A real example

Take [v13.34.0](https://github.com/laravel/framework/releases/tag/v13.34.0). You may have been manually tracking how long your jobs take to process, but that duration is now available in a single event. That means your application becomes lighter, and you can lean more on the framework instead of maintaining your own code for it.

That's the kind of thing you'd never spot unless you were reading the releases, and it's an easy win: delete some code, let Laravel handle it.

## What about AI?

This is also something AI can help you with, for example by summarising a release for you. But I still think you should drive it yourself and figure out what's valuable and what's not. You know your application better than any summary does.

## Wrapping up

Make it a habit: Generally a realease happens every Tuesday weekly (though sometimes it can be a Wednesday).. make a calendar entry so you don't forget and skim the releases when they land, and ask yourself "could this simplify something in my app?" Even if the answer is usually no, the one time it's yes will make it worth it. This basically means your app is less complicated in the long run, so for sure worth it.
