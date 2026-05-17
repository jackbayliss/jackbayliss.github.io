---
title: "How to Test Laravel's Development Branch Before a Release"
showToc: false
date: 2026-05-17
tags: ['PHP', 'Laravel', 'Composer', 'Laravel 13']
description: "Use composer to pull in Laravel's current development branch and test unreleased features before they ship."
---

So, I often set the `laravel/framework` version in composer to `13.x-dev` (13.x being the current branch). This means I can quickly test the latest and greatest features without waiting for the official release!

You'll have to run a `composer update` after making the change, but it's really useful to check commits that've been merged in that you want to verify, or there's new features you want to play around with before they land in a tagged release.

I picked this up by looking at the 13.x branch on GitHub, so thought I'd share. No super long post today.