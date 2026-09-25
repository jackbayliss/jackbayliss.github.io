(function () {
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(pointer: fine)').matches;

    /*
     * Mobile menu.
     */
    var menuToggle = document.getElementById('menu-toggle');

    function setMenu(open) {
        document.body.classList.toggle('menu-open', open);
        menuToggle.setAttribute('aria-expanded', open);
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', function () {
            setMenu(!document.body.classList.contains('menu-open'));
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') setMenu(false);
        });
    }

    /*
     * "Hi, I'm Jack." letters lift towards the pointer.
     */
    var title = document.querySelector('[data-letters]');

    if (title) {
        var text = title.textContent;
        title.setAttribute('aria-label', text);
        title.textContent = '';

        var letters = Array.from(text).map(function (char) {
            if (char === ' ') {
                title.appendChild(document.createTextNode(' '));
                return null;
            }

            var letter = document.createElement('span');
            letter.className = 'letter';
            letter.style.setProperty('--i', title.children.length);
            letter.setAttribute('aria-hidden', 'true');
            letter.textContent = char;
            title.appendChild(letter);

            return letter;
        }).filter(Boolean);

        if (finePointer && !reducedMotion) {
            title.addEventListener('pointermove', function (e) {
                var left = title.getBoundingClientRect().left;

                letters.forEach(function (letter) {
                    var centre = left + letter.offsetLeft + letter.offsetWidth / 2;
                    var lift = Math.max(0, 1 - Math.abs(e.clientX - centre) / 140);

                    letter.style.setProperty('--lift', lift.toFixed(3));
                });
            });

            title.addEventListener('pointerleave', function () {
                letters.forEach(function (letter) {
                    letter.style.setProperty('--lift', 0);
                });
            });
        }
    }

    /*
     * Header clock, always UK time.
     */
    var clock = document.querySelector('[data-clock]');

    if (clock) {
        var time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London' });

        var tick = function () {
            clock.textContent = "It's " + time.format(new Date()) + ' for me';
        };

        tick();
        clock.hidden = false;
        setInterval(tick, 1000 * 30);
    }

    /*
     * The footer is a little code editor that never stops typing.
     */
    var editor = document.querySelector('[data-editor]');

    if (editor) {
        var source = [
            "<?php",
            "",
            "namespace App\\Models;",
            "",
            "class Jack extends Model",
            "{",
            "    protected $casts = [",
            "        'accent' => BlackCountry::class,",
            "        'beard' => 'ginger',",
            "    ];",
            "",
            "    public function morning(): void",
            "    {",
            "        Tea::make()->milk()->sugars(2);",
            "",
            "        if (now()->isMonday()) {",
            "            $this->coffee()->double();",
            "        }",
            "    }",
            "",
            "    public function work(): void",
            "    {",
            "        $this->standup()->keepItShort();",
            "",
            "        $this->tickets()->each->ship();",
            "    }",
            "",
            "    public function openSource(): void",
            "    {",
            "        $this->pullRequests()",
            "            ->where('repo', 'laravel/framework')",
            "            ->each->hopeTaylorMerges();",
            "    }",
            "",
            "    public function evening(): void",
            "    {",
            "        $this->gym()->skip(reason: 'leg day');",
            "",
            "        Swift::feed(); // he still won't care",
            "",
            "        $this->play(Game::random());",
            "    }",
            "",
            "    public function greet(Person $person): string",
            "    {",
            "        return \"Alright, bab? {$person->name}\";",
            "    }",
            "}",
        ].join('\n');

        var pattern = /(\/\/.*)|('[^'\n]*'?|"[^"\n]*"?)|(\$\w+)|(<\?php)|\b(namespace|use|class|extends|public|protected|function|return|if|void|string)\b|(->|::)(\w+)|\b([A-Z]\w*)\b|\b([a-z_]\w*)(?=\()|([()[\]{};,=>:])/g;
        var types = [null, 'comment', 'string', 'variable', 'keyword', 'keyword'];

        var tokenize = function (code) {
            var tokens = [];
            var last = 0;
            var match;

            pattern.lastIndex = 0;

            while ((match = pattern.exec(code))) {
                if (match.index > last) tokens.push({ text: code.slice(last, match.index) });

                if (match[6]) {
                    tokens.push({ text: match[6], type: 'punctuation' }, { text: match[7], type: 'method' });
                } else if (match[8]) {
                    tokens.push({ text: match[8], type: 'class' });
                } else if (match[9]) {
                    tokens.push({ text: match[9], type: 'method' });
                } else if (match[10]) {
                    tokens.push({ text: match[10], type: 'punctuation' });
                } else {
                    for (var i = 1; i <= 5; i++) {
                        if (match[i]) tokens.push({ text: match[i], type: types[i] });
                    }
                }

                last = pattern.lastIndex;
            }

            if (last < code.length) tokens.push({ text: code.slice(last) });

            return tokens;
        };

        var gutter = editor.querySelector('[data-gutter]');
        var code = editor.querySelector('[data-code]');
        var caret = document.createElement('span');
        caret.className = 'caret';

        // Every character gets its own span so it can be revealed while typing,
        // and knocked about when the pointer gets close.
        var chars = [];

        tokenize(source).forEach(function (token) {
            Array.from(token.text).forEach(function (char) {
                if (char === '\n') {
                    var newline = document.createTextNode('\n');
                    code.appendChild(newline);
                    chars.push({ node: newline, newline: true });
                    return;
                }

                var span = document.createElement('span');
                span.className = 'char' + (token.type ? ' tok-' + token.type : '');
                span.textContent = char;
                code.appendChild(span);
                chars.push({ node: span });
            });
        });

        var line = 1;
        var shown = 0;

        var reveal = function (length) {
            for (; shown < length; shown++) {
                var char = chars[shown];
                if (char.newline) line += 1;
                else char.node.classList.add('is-typed');
            }

            code.insertBefore(caret, chars[length] ? chars[length].node : null);
            gutter.textContent = Array.from({ length: line }, function (_, i) { return i + 1; }).join('\n');
            editor.scrollTop = Math.max(0, caret.offsetTop - editor.clientHeight + 140);
        };

        var reset = function () {
            chars.forEach(function (char) {
                if (!char.newline) char.node.classList.remove('is-typed');
            });

            line = 1;
            shown = 0;
            reveal(0);
        };

        var footer = editor.closest('.site-footer');

        footer.addEventListener('click', function (e) {
            if (!e.target.closest('a')) footer.classList.toggle('is-lit');
        });

        // Start with the first few lines already written, so the footer is never empty.
        var head = source.split('\n').slice(0, 9).join('\n').length;

        if (reducedMotion) {
            reveal(chars.length);
        } else {
            var length = head;

            var type = function () {
                length += 1;
                reveal(length);

                if (length < chars.length) {
                    return setTimeout(type, chars[length - 1].newline ? 220 : 25 + Math.random() * 55);
                }

                setTimeout(function () {
                    length = head;
                    reset();
                    reveal(head);
                    setTimeout(type, 800);
                }, 5000);
            };

            reset();
            reveal(head);

            new IntersectionObserver(function (entries, observer) {
                if (!entries[0].isIntersecting) return;
                observer.disconnect();
                type();
            }, { threshold: 0.3 }).observe(footer);
        }

        // Letters get knocked out of the way by the crosshair, then spring back.
        if (finePointer && !reducedMotion) {
            var pushed = [];
            var pending = null;
            var measured = false;

            // Where each letter sits in the code never changes, so measure once (and again on resize).
            var measure = function () {
                var origin = code.getBoundingClientRect();

                chars.forEach(function (char) {
                    if (char.newline) return;

                    var box = char.node.getBoundingClientRect();
                    char.x = box.left - origin.left + box.width / 2;
                    char.y = box.top - origin.top + box.height / 2;
                });

                measured = true;
            };

            var release = function () {
                pushed.forEach(function (span) { span.style.transform = ''; });
                pushed = [];
            };

            var scatter = function (e, radius, strength) {
                if (!measured) measure();

                var origin = code.getBoundingClientRect();
                var px = e.clientX - origin.left;
                var py = e.clientY - origin.top;

                release();

                chars.forEach(function (char, i) {
                    if (char.newline || i >= shown) return;

                    var dx = char.x - px;
                    var dy = char.y - py;
                    var distance = Math.hypot(dx, dy);

                    if (distance > radius) return;

                    var force = (1 - distance / radius) * strength;
                    var angle = Math.atan2(dy, dx);
                    var spin = ((i * 37) % 60) - 30;

                    char.node.style.transform = 'translate(' + (Math.cos(angle) * force).toFixed(1) + 'px, ' + (Math.sin(angle) * force).toFixed(1) + 'px) rotate(' + (spin * force / strength).toFixed(1) + 'deg)';
                    pushed.push(char.node);
                });
            };

            window.addEventListener('resize', function () { measured = false; });

            footer.addEventListener('pointermove', function (e) {
                if (!pending) requestAnimationFrame(function () {
                    scatter(pending, 64, 18);
                    pending = null;
                });

                pending = e;
            });

            footer.addEventListener('pointerdown', function (e) {
                if (e.target.closest('a')) return;

                scatter(e, 150, 46);
                setTimeout(release, 220);
            });

            footer.addEventListener('pointerleave', release);
        }
    }

    /*
     * Highlight the section you're reading in a post's "On this page" list.
     */
    var toc = document.querySelector('[data-toc]');

    if (toc && 'IntersectionObserver' in window) {
        var links = {};

        toc.querySelectorAll('a[href^="#"]').forEach(function (link) {
            links[decodeURIComponent(link.hash.slice(1))] = link;
        });

        var current = null;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting || !links[entry.target.id]) return;
                if (current) current.classList.remove('is-current');
                current = links[entry.target.id];
                current.classList.add('is-current');
            });
        }, { rootMargin: '0px 0px -70% 0px' });

        Object.keys(links).forEach(function (id) {
            var heading = document.getElementById(id);
            if (heading) observer.observe(heading);
        });
    }

    /*
     * Filter the blog list by topic.
     */
    var topics = document.querySelector('[data-topics]');

    if (topics) {
        topics.addEventListener('click', function (e) {
            var button = e.target.closest('[data-topic]');
            if (!button) return;

            var topic = button.dataset.topic;

            topics.querySelectorAll('[data-topic]').forEach(function (chip) {
                chip.classList.toggle('is-active', chip === button);
            });

            document.querySelectorAll('.archive-year').forEach(function (year) {
                var visible = 0;

                year.querySelectorAll('[data-tags]').forEach(function (row) {
                    var show = !topic || row.dataset.tags.split(' ').indexOf(topic) !== -1;
                    row.hidden = !show;
                    if (show) visible += 1;
                });

                year.hidden = visible === 0;
            });
        });
    }

    /*
     * Lightbox for the photos on the about page.
     */
    document.querySelectorAll('.lightbox-img').forEach(function (img) {
        img.addEventListener('click', function () {
            var overlay = document.createElement('div');
            overlay.className = 'lightbox-overlay';

            var full = document.createElement('img');
            full.src = img.src;
            full.alt = img.alt;
            overlay.appendChild(full);

            function close() {
                overlay.remove();
                document.removeEventListener('keydown', onKeydown);
            }

            function onKeydown(e) {
                if (e.key === 'Escape') close();
            }

            overlay.addEventListener('click', close);
            document.addEventListener('keydown', onKeydown);
            document.body.appendChild(overlay);
        });
    });
})();
