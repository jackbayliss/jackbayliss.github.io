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
     * A soft ring that follows the cursor over links and the title.
     */
    if (finePointer && !reducedMotion) {
        var ring = document.createElement('div');
        ring.className = 'cursor-ring';
        document.body.appendChild(ring);

        var x = -100, y = -100, ringX = x, ringY = y;

        document.addEventListener('pointermove', function (e) {
            x = e.clientX;
            y = e.clientY;
        });

        document.addEventListener('pointerover', function (e) {
            ring.classList.toggle('is-active', !!e.target.closest('a, button, [data-letters], .lightbox-img'));
        });

        (function follow() {
            ringX += (x - ringX) * 0.2;
            ringY += (y - ringY) * 0.2;
            ring.style.transform = 'translate3d(' + ringX + 'px, ' + ringY + 'px, 0)';
            requestAnimationFrame(follow);
        })();
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

        var render = function (length) {
            var text = source.slice(0, length);
            var lines = text.split('\n').length;

            code.textContent = '';

            tokenize(text).forEach(function (token) {
                var span = document.createElement('span');
                if (token.type) span.className = 'tok-' + token.type;
                span.textContent = token.text;
                code.appendChild(span);
            });

            code.appendChild(caret);

            gutter.textContent = Array.from({ length: lines }, function (_, i) { return i + 1; }).join('\n');
            editor.scrollTop = editor.scrollHeight;
        };

        var footer = editor.closest('.site-footer');

        footer.addEventListener('click', function (e) {
            if (!e.target.closest('a')) footer.classList.toggle('is-lit');
        });

        if (reducedMotion) {
            render(source.length);
        } else {
            var length = 0;

            var type = function () {
                length += 1;
                render(length);

                if (length < source.length) {
                    var char = source[length - 1];
                    return setTimeout(type, char === '\n' ? 220 : 25 + Math.random() * 55);
                }

                setTimeout(function () {
                    length = 0;
                    render(0);
                    setTimeout(type, 800);
                }, 5000);
            };

            render(0);

            new IntersectionObserver(function (entries, observer) {
                if (!entries[0].isIntersecting) return;
                observer.disconnect();
                type();
            }, { threshold: 0.3 }).observe(footer);
        }
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
