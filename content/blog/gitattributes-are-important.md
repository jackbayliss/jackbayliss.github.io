---
title: ".gitattributes are important, but often forgotten!"
showToc: false
date: "2026-08-11"
tags: ['PHP', 'Git', '.gitattributes','composer']
description: ".gitattributes are important, but often forgotten"
---

One thing I notice quite often is that .gitattributes are forgotten, now I actually did this myself... 
I am a maintainer for [laravel-dom-assertions](https://github.com/sinnbeck/laravel-dom-assertions) and it wasn't [until recently](https://github.com/sinnbeck/laravel-dom-assertions/pull/87) I realised that we were shipping out a loadddd of stuff the end user didn't need.

## What is .gitattributes

Essentially, The .gitattributes file is a text file in Git that defines how specific files in a repository should be handled, such as how they're exported, and what line endings to use etc..

Here's an example:
```md
# for every file (*), automatically detect whether it's text or binary, and if it's text, normalize its line endings
* text=auto

# These attributes say waht driver to use when diffs happen in these files
*.blade.php diff=html 
*.css diff=css
*.html diff=html
*.md diff=markdown
*.php diff=php

# We tell Git when releasing.. we want to ignore all of the following- this is arguably the most important.
/.github export-ignore
/build export-ignore
/phpstan export-ignore
/tests export-ignore
/.gitattributes export-ignore
/.gitignore export-ignore
/CHANGELOG.md export-ignore
/CODEOWNERS export-ignore
/CONTRIBUTING.md export-ignore
/phpstan.neon.dist export-ignore
/phpunit.xml export-ignore
/pint.json export-ignore
/rector.php export-ignore
```

## So why is it important?

In my opinion, it's similar to CS styling, it ensures all the line endings are correct... it helps the end user. The most important one is the export-ignore lines, if you have a 20mb art file in your package, without it it's being shipped to EVERYONE requiring it, resulting in longer composer install times and data usage. I like to think of "every little helps".. the less size, the easier and more accessible it is right?

On that note... perhaps some CI tool would be nice for this? Just a super small workflow that checks all the usual suspects?
