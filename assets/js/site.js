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
     * A line of PHP in the footer that types itself out, over and over.
     */
    var typer = document.querySelector('[data-typer]');

    if (typer) {
        var snippets = [
            "Route::get('/', fn () => 'Alright!');",
            "$jack->contribute(to: 'laravel');",
            "collect($prs)->filter->merged();",
            "User::where('name', 'Jack')->first();",
            "dispatch(new ShipIt($feature));",
            "Cache::remember('tea', 3600, $brew);",
            "return view('home', ['bab' => true]);",
        ];

        var pattern = /('[^']*'?)|(\$\w+)|\b(return|new|fn|true|false)\b|(->|::)(\w+)|\b([A-Z]\w*)\b|\b([a-z_]\w*)(?=\()|([()[\]{};,=>])/g;

        var tokenize = function (code) {
            var tokens = [];
            var last = 0;
            var match;

            pattern.lastIndex = 0;

            while ((match = pattern.exec(code))) {
                if (match.index > last) tokens.push({ text: code.slice(last, match.index) });

                if (match[1]) tokens.push({ text: match[1], type: 'string' });
                else if (match[2]) tokens.push({ text: match[2], type: 'variable' });
                else if (match[3]) tokens.push({ text: match[3], type: 'keyword' });
                else if (match[4]) tokens.push({ text: match[4], type: 'punctuation' }, { text: match[5], type: 'method' });
                else if (match[6]) tokens.push({ text: match[6], type: 'class' });
                else if (match[7]) tokens.push({ text: match[7], type: 'method' });
                else tokens.push({ text: match[8], type: 'punctuation' });

                last = pattern.lastIndex;
            }

            if (last < code.length) tokens.push({ text: code.slice(last) });

            return tokens;
        };

        var render = function (code, length) {
            typer.textContent = '';

            tokenize(code.slice(0, length)).forEach(function (token) {
                var span = document.createElement('span');
                if (token.type) span.className = 'tok-' + token.type;
                span.textContent = token.text;
                typer.appendChild(span);
            });
        };

        typer.parentElement.addEventListener('click', function () {
            typer.parentElement.classList.toggle('is-lit');
        });

        if (reducedMotion) {
            render(snippets[0], snippets[0].length);
        } else {
            var index = 0;
            var length = 0;
            var deleting = false;

            (function step() {
                var code = snippets[index];
                var delay;

                length += deleting ? -1 : 1;
                render(code, length);

                if (!deleting && length === code.length) {
                    deleting = true;
                    delay = 2200;
                } else if (deleting && length === 0) {
                    deleting = false;
                    index = (index + 1) % snippets.length;
                    delay = 500;
                } else {
                    delay = deleting ? 22 : 45 + Math.random() * 70;
                }

                setTimeout(step, delay);
            })();
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
