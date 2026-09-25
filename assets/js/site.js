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
