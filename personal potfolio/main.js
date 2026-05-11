/* ═══════════════════════════════════════════════
   PRITI PORTFOLIO — main.js
   ═══════════════════════════════════════════════ */

/* ────────────────────────────────────────────────
   1. TYPED.JS  — hero text animation
──────────────────────────────────────────────── */
new Typed('#element', {
    strings: ['Web Developer.', 'Graphic Designer.', 'Web Designer.', 'UI/UX Designer.'],
    typeSpeed:    55,
    backSpeed:    25,
    backDelay:    1800,
    loop:         true,
    smartBackspace: true
});


/* ────────────────────────────────────────────────
   2. CURSOR SYSTEM
   ① Smoke trail  — canvas, rises & fades
   ② Dot          — snaps to exact mouse position
   ③ Ring         — lags behind with lerp (0.10)
   ④ Hover expand — grows on interactive elements
   ⑤ Click pulse  — shrinks dot, tightens ring
   ⑥ Magnetic     — [data-magnetic] buttons pulled
──────────────────────────────────────────────── */
(function initCursor() {

    /* ── Elements ── */
    const smokeCanvas = document.getElementById('smoke-canvas');
    const sCtx        = smokeCanvas.getContext('2d');
    const dot         = document.getElementById('cursor-dot');
    const ring        = document.getElementById('cursor-ring');

    /* ── Resize smoke canvas ── */
    function resizeSmoke() {
        smokeCanvas.width  = window.innerWidth;
        smokeCanvas.height = window.innerHeight;
    }
    resizeSmoke();
    window.addEventListener('resize', resizeSmoke);

    /* ── Mouse state ── */
    let mouseX = -400, mouseY = -400;
    let prevX  = -400, prevY  = -400;
    let ringX  = -400, ringY  = -400;   // lerp-smoothed ring position

    document.addEventListener('mousemove', (e) => {
        prevX  = mouseX; prevY  = mouseY;
        mouseX = e.clientX; mouseY = e.clientY;

        /* Dot snaps instantly */
        dot.style.left = mouseX + 'px';
        dot.style.top  = mouseY + 'px';
    });

    /* ── Hover & click classes ── */
    const interactiveEls = 'a, button, input, textarea, .skill-card, .about-card, .project-card';
    document.querySelectorAll(interactiveEls).forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
    document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
    document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));

    /* ── Smoke particles ── */
    const PALETTE = [
        { r:224, g:68,  b:154 },
        { r:200, g:60,  b:190 },
        { r:155, g:93,  b:229 },
        { r:120, g:60,  b:255 },
        { r:255, g:100, b:180 },
        { r:180, g:80,  b:220 },
    ];
    const particles = [];
    const MAX_P = 200;
    let   emitAcc = 0;

    function emitPuff(ox, oy, speed) {
        if (particles.length >= MAX_P) return;
        const col    = PALETTE[Math.floor(Math.random() * PALETTE.length)];
        const spread = Math.min(speed * 0.25, 10);
        particles.push({
            x: ox + (Math.random() - 0.5) * spread,
            y: oy + (Math.random() - 0.5) * spread,
            vx: (Math.random() - 0.5) * 0.9,
            vy: -(Math.random() * 1.5 + 0.4),
            curlX: (Math.random() - 0.5) * 0.05,
            curlY: (Math.random() - 0.5) * 0.03,
            radius:    Math.random() * 5  + 3,
            maxRadius: Math.random() * 30 + 18,
            growRate:  Math.random() * 0.6 + 0.22,
            alpha:     Math.random() * 0.36 + 0.20,
            decay:     Math.random() * 0.009 + 0.006,
            r: col.r, g: col.g, b: col.b,
        });
    }

    /* ── Magnetic buttons ── */
    const magnets = document.querySelectorAll('[data-magnetic]');
    const MAG_STRENGTH = 0.38;   // 0 = no pull, 1 = full snap

    magnets.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const cx   = rect.left + rect.width  / 2;
            const cy   = rect.top  + rect.height / 2;
            const dx   = (e.clientX - cx) * MAG_STRENGTH;
            const dy   = (e.clientY - cy) * MAG_STRENGTH;
            el.style.transform = `translate(${dx}px, ${dy}px)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate(0,0)';
        });
    });

    /* ── Main RAF loop ── */
    function animate() {

        /* Ring lerp — lags behind mouse for trail feel */
        ringX += (mouseX - ringX) * 0.10;
        ringY += (mouseY - ringY) * 0.10;
        ring.style.left = ringX + 'px';
        ring.style.top  = ringY + 'px';

        /* Smoke emission */
        const speed = Math.hypot(mouseX - prevX, mouseY - prevY);
        emitAcc += speed * 0.16 + 0.55;
        const toEmit = Math.floor(emitAcc);
        emitAcc -= toEmit;
        for (let i = 0; i < Math.min(toEmit, 5); i++) emitPuff(mouseX, mouseY, speed);

        /* Draw smoke */
        sCtx.clearRect(0, 0, smokeCanvas.width, smokeCanvas.height);
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.vx += p.curlX;
            p.vy += p.curlY;
            p.vx *= 0.986;
            p.vy *= 0.986;
            p.x  += p.vx;
            p.y  += p.vy;
            p.radius = Math.min(p.radius + p.growRate, p.maxRadius);
            p.alpha -= p.decay;
            if (p.alpha <= 0) { particles.splice(i, 1); continue; }

            const g = sCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
            g.addColorStop(0,    `rgba(${p.r},${p.g},${p.b},${p.alpha})`);
            g.addColorStop(0.45, `rgba(${p.r},${p.g},${p.b},${p.alpha * 0.45})`);
            g.addColorStop(1,    `rgba(${p.r},${p.g},${p.b},0)`);

            sCtx.beginPath();
            sCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            sCtx.fillStyle = g;
            sCtx.fill();
        }

        requestAnimationFrame(animate);
    }
    animate();

})();



/* ────────────────────────────────────────────────
   3. BACKGROUND AMBIENT PARTICLES
──────────────────────────────────────────────── */
(function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    const ctx    = canvas.getContext('2d');
    const pts    = [];

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function mkPt() {
        return {
            x:  Math.random() * canvas.width,
            y:  Math.random() * canvas.height,
            r:  Math.random() * 1.5 + 0.4,
            dx: (Math.random() - 0.5) * 0.4,
            dy: (Math.random() - 0.5) * 0.4,
            a:  Math.random() * 0.5 + 0.1,
            c:  Math.random() > 0.5 ? '224,68,154' : '155,93,229'
        };
    }
    for (let i = 0; i < 80; i++) pts.push(mkPt());

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pts.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.c},${p.a})`;
            ctx.fill();
            p.x += p.dx; p.y += p.dy;
            if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
            if (p.y < 0 || p.y > canvas.height)  p.dy *= -1;
        });
        requestAnimationFrame(draw);
    }
    draw();
})();


/* ────────────────────────────────────────────────
   4. SCROLL REVEAL
──────────────────────────────────────────────── */
(function initReveal() {
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.15 });
    els.forEach(el => obs.observe(el));
})();


/* ────────────────────────────────────────────────
   5. SKILL BARS — animate on scroll into view
──────────────────────────────────────────────── */
(function initSkillBars() {
    const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('.bar-fill').forEach(b => {
                    b.style.width = b.dataset.width + '%';
                });
            }
        });
    }, { threshold: 0.3 });
    document.querySelectorAll('.skill-card').forEach(c => obs.observe(c));
})();


/* ────────────────────────────────────────────────
   6. ACTIVE NAV HIGHLIGHT on scroll
──────────────────────────────────────────────── */
(function initNav() {
    const secs  = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('nav ul li a');

    window.addEventListener('scroll', () => {
        let current = '';
        secs.forEach(s => { if (window.scrollY >= s.offsetTop - 90) current = s.id; });
        links.forEach(a => {
            const isActive = a.getAttribute('href') === '#' + current;
            a.classList.toggle('active', isActive);
        });
    }, { passive: true });
})();


/* ────────────────────────────────────────────────
   7. CONTACT FORM — Formspree integration
   Endpoint: https://formspree.io/f/mrerjnlg
──────────────────────────────────────────────── */
(function initContactForm() {
    const form    = document.getElementById('contactForm');
    const sendBtn = document.getElementById('sendBtn');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        /* Basic client-side validation */
        const name    = form.querySelector('#fname').value.trim();
        const email   = form.querySelector('#femail').value.trim();
        const subject = form.querySelector('#fsubject').value.trim();
        const message = form.querySelector('#fmessage').value.trim();

        if (!name || !email || !subject || !message) {
            showToast('⚠️ Please fill in all fields!', '#e04444');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showToast('⚠️ Please enter a valid email!', '#e04444');
            return;
        }

        /* Loading state */
        sendBtn.textContent = 'Sending…';
        sendBtn.disabled    = true;

        try {
            const res = await fetch('https://formspree.io/f/mrerjnlg', {
                method:  'POST',
                headers: { 'Accept': 'application/json' },
                body:    new FormData(form)
            });

            if (res.ok) {
                form.reset();
                showToast('✅ Message sent! I\'ll reply soon 🎉');
            } else {
                const data = await res.json();
                const err  = data?.errors?.map(e => e.message).join(', ') || 'Something went wrong.';
                showToast('❌ ' + err, '#e04444');
            }
        } catch (_) {
            showToast('❌ Network error. Please try again.', '#e04444');
        } finally {
            sendBtn.textContent = 'Send Message ✉️';
            sendBtn.disabled    = false;
        }
    });
})();


/* ────────────────────────────────────────────────
   TOAST HELPER
──────────────────────────────────────────────── */
function showToast(msg, bg) {
    const toast      = document.getElementById('toast');
    toast.textContent  = msg;
    toast.style.background = bg || 'linear-gradient(135deg,#e0449a,#9b5de5)';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
}