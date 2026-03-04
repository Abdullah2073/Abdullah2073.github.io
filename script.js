/* ================================================================
   ABDULLAH PORTFOLIO — script.js  v2.1
   Key fix: body.js-loaded gates all reveal animations so content
   is always visible even before JS runs.
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Add js-loaded to body IMMEDIATELY so CSS can enable animations
  document.body.classList.add('js-loaded');

  /* ──────────────────────────────────────────────
     1. LOADER
  ────────────────────────────────────────────── */
  const loader = document.getElementById('loader');

  function hideLoader() {
    loader.classList.add('hidden');
    // Animate hero elements in sequence after loader hides
    const heroEls = document.querySelectorAll('#hero .reveal-fade, #hero .reveal-up');
    heroEls.forEach(el => el.classList.add('in'));
  }

  if (document.readyState === 'complete') {
    setTimeout(hideLoader, 700);
  } else {
    window.addEventListener('load', () => setTimeout(hideLoader, 700));
  }

  /* ──────────────────────────────────────────────
     2. NEURAL NETWORK BACKGROUND CANVAS
  ────────────────────────────────────────────── */
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, nodes, raf;
    const MAX_DIST = 130;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = document.documentElement.clientHeight || window.innerHeight;
    }

    function initNodes() {
      const count = Math.min(Math.floor((W * H) / 16000), 80);
      nodes = Array.from({ length: count }, () => ({
        x:  Math.random() * W,
        y:  Math.random() * H,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r:  Math.random() * 1.4 + 0.5,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      });
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < MAX_DIST) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(0,212,255,${(1 - d / MAX_DIST) * 0.11})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
        ctx.beginPath();
        ctx.arc(nodes[i].x, nodes[i].y, nodes[i].r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,212,255,0.18)';
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }

    resize(); initNodes(); draw();
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        cancelAnimationFrame(raf);
        resize(); initNodes(); draw();
      }, 200);
    });
  }

  /* ──────────────────────────────────────────────
     3. NAVBAR — scroll class + mobile toggle
  ────────────────────────────────────────────── */
  const navbar    = document.getElementById('navbar');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks  = document.getElementById('nav-links');

  // Scroll: add .scrolled class
  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
    updateNavActive();
    toggleBackToTop();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  // Mobile menu toggle
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
    // Prevent body scroll when menu open
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on link click
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  /* ──────────────────────────────────────────────
     4. ACTIVE NAV LINK
  ────────────────────────────────────────────── */
  const sections   = Array.from(document.querySelectorAll('section[id]'));
  const navAnchors = Array.from(navLinks.querySelectorAll('a'));

  function updateNavActive() {
    const scrollY = window.scrollY + 120;
    let current = '';
    sections.forEach(sec => {
      if (scrollY >= sec.offsetTop) current = sec.id;
    });
    navAnchors.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
    });
  }

  /* ──────────────────────────────────────────────
     5. SCROLL REVEAL (Intersection Observer)
        Excludes hero (handled by loader above).
        Large rootMargin ensures elements trigger
        well before they scroll into view.
  ────────────────────────────────────────────── */
  const revealEls = document.querySelectorAll(
    'section:not(#hero) .reveal-fade, section:not(#hero) .reveal-up, section:not(#hero) .reveal-left, section:not(#hero) .reveal-right'
  );

  // Fallback: if IntersectionObserver not available, show all immediately
  if (!('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('in'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0,           // trigger as soon as ANY pixel is visible
      rootMargin: '0px 0px -10px 0px'  // very small offset
    });

    revealEls.forEach(el => revealObserver.observe(el));

    // Safety net: after 2s, force-reveal everything still hidden
    setTimeout(() => {
      revealEls.forEach(el => el.classList.add('in'));
    }, 2000);
  }

  /* ──────────────────────────────────────────────
     6. SKILL BARS — animate on scroll
  ────────────────────────────────────────────── */
  const skillFills = document.querySelectorAll('.sk-fill');

  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const w  = el.getAttribute('data-w');
        if (w) el.style.width = w + '%';
        barObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  skillFills.forEach(f => barObserver.observe(f));

  /* ──────────────────────────────────────────────
     7. PROJECT CARDS — 3D tilt on hover
  ────────────────────────────────────────────── */
  // Only on non-touch devices
  const isTouch = window.matchMedia('(hover: none)').matches;
  if (!isTouch) {
    document.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const cx   = rect.left + rect.width  / 2;
        const cy   = rect.top  + rect.height / 2;
        const rx   = ((e.clientY - cy) / (rect.height / 2)) * -5;
        const ry   = ((e.clientX - cx) / (rect.width  / 2)) *  5;
        card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ──────────────────────────────────────────────
     8. BACK TO TOP
  ────────────────────────────────────────────── */
  const backToTop = document.getElementById('back-to-top');

  function toggleBackToTop() {
    backToTop.classList.toggle('visible', window.scrollY > 450);
  }

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ──────────────────────────────────────────────
     9. CONTACT FORM — UX feedback
  ────────────────────────────────────────────── */
  const form      = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();

      const origHTML = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Message Sent!';
      submitBtn.style.cssText = 'background: var(--green); color: var(--bg); pointer-events:none;';

      setTimeout(() => {
        submitBtn.innerHTML  = origHTML;
        submitBtn.style.cssText = '';
        form.reset();
      }, 3500);
    });

    // Live validation hints
    form.querySelectorAll('input[required], textarea[required]').forEach(field => {
      field.addEventListener('blur', () => {
        if (field.value.trim() && field.checkValidity()) {
          field.style.borderColor = 'rgba(0,229,160,0.5)';
        } else if (!field.value.trim()) {
          field.style.borderColor = '';
        }
      });
      field.addEventListener('focus', () => {
        field.style.borderColor = '';
      });
    });
  }

  /* ──────────────────────────────────────────────
     10. SMOOTH ANCHOR SCROLLING
         Accounts for fixed navbar height
  ────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH   = navbar.offsetHeight;
      const top    = target.getBoundingClientRect().top + window.scrollY - navH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

});
