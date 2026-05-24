---
title: "How to PR to Laravel"
showToc: true
date: 2026-04-27
tags: ['PHP', 'Laravel', 'Open Source', 'Contributing']
description: "An 8-step guide to successfully contributing pull requests to the Laravel framework, covering source code familiarity, real-world problem framing, tests, branch targeting, and PR descriptions."
---

I've had a few people message me on Linkedin, of all places?! Asking how to PR to Laravel, or for ideas. There's no "secret method", but I'll outline some great steps to success below. I thought I'd put this out there, as it may not be obvious.
The below isn't a tutorial, so no guarantee it'll work but is generally what I try to follow:

## 1. Take some time to read the source code

Clone the framework repo, composer install, load it up locally, and genuinely go through it. Even if it's one class at a time that you're using. It's important to understand the classes if you plan on making a change, even if its a small section.


## 2. Ensure the PR is fixing a real problem

At the moment in the world of AI, it's easy to run Claude and blindly believe what it's telling you. But, your PR should be fixing a **real world problem**.
Take inspiration from your work projects, look for genuine pain points such as repeated odd code, or places where you're having to repeat a lot of logic. This could be tests, controllers, etc.

It may not be code, it could be things you want to see, but there isn't a way via Laravel's API yet.


## 3. Be certain you can explain clearly

Being able to articulate the problem in the PR description is key, if you can break down the issue ie the before vs after, it's easier for Taylor to figure out what you're trying to implement.. but also keep it short nobody wants to read 70 pages 😀
As long as you can explain the problem, the fix, and why it's a needed... otherwise it'll be hard to get in.


## 4. Check over existing PR requests

Go through existing pull requests **including closed PRs**, search for a few matching terms of your idea and ensure it's not been done before. This saves you time trying an idea that may have been tried before, or it may inspire you to take an alternative approach.

## 5. Ensure you're not submitting around events

There's a lot of events throughout the year, Laravel Lives, Laracons etc. If you're going to submit a big PR or something that needs to be considered, you need to be mindful of events, ie don't submit it around busy periods, new releases etc. There's a right time to submit things. I tend to leave things in draft until the events are over, as ultimately this gives your PR the best chance, and makes sure you're not bombarding Big T.


## 6. The Code

The code should match the existing style generally, ie you're adding methods are they're all Pascal case, it should match. It should feel natural when you look at the code you're adding vs the code that's already there. Think of it as a craft, you wouldn't hammer a nail through glass.
After you've done that, arguably... the most important part is the tests, you should add a test to prove your code does what's intended. It's easy to copy an existing test and edit it, but again make sure it follows the overall feel, ie if they all use mocks, yours should too.
Then, make sure your tests pass, as well as the overall file you've added it in (ie be sure we've not created a regression)


## 7. Ensure you target the right branch

The current branch should be targeted if it's **not a breaking change**... what does that mean? Well, if you're editing an Interface (Contract) that's a breaking change, as an example. Ie forcing any existing code to follow the change you've made. 
If there's no way around the breaking change, you should target master. Google may give you a better breaking change example if you're stuck!

## 8. Create the PR

The easiest part! Create the PR with an easy-to-follow description and ensure that CI is passing (ie the tests), if the StyleCI CI item is failing, dont panic.. that's just styling and it will automatically be fixed if Taylor merges your PR. (Or, take its fixes and apply them before hand) 


## 9. Wait

Taylor generally goes through PR's daily, but take in to consideration time zone. If it's a fairly big PR it could take some time, don't be impatient.
If it gets merged, well done! If it doesn't also well done! Some PRs won't ever make it, and that's fine. It's an iterative process where over time you'll start to figure more and more out!
