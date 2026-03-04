/* ============================================================
   ABDULLAH PORTFOLIO — script.js v3
   All sections visible by default in CSS.
   JS only adds optional scroll animations on top.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. LOADER ─────────────────────────────────── */
  const loader = document.getElementById('loader');

  function hideLoader() {
    loader.classList.add('hidden');
  }

  // Hide loader after fonts/images settle
  if (document.readyState === 'complete') {
    setTimeout(hideLoader, 600);
  } else {
    window.addEventListener('load', () => setTimeout(hideLoader, 600));
  }
  // Hard fallback: always hide after 2s no matter what
  setTimeout(hideLoader, 2000);

  /* ── 2. NEURAL NETWORK CANVAS ────────────────── */
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, nodes, raf;
    const MAX = 130;

    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    const init = () => {
      const n = Math.min(Math.floor(W * H / 16000), 80);
      nodes = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .28, vy: (Math.random() - .5) * .28,
        r: Math.random() * 1.4 + .5,
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      });
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const d  = Math.sqrt(dx*dx + dy*dy);
          if (d < MAX) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(0,212,255,${(1 - d/MAX) * .11})`;
            ctx.lineWidth = .6; ctx.stroke();
          }
        }
        ctx.beginPath();
        ctx.arc(nodes[i].x, nodes[i].y, nodes[i].r, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(0,212,255,0.18)'; ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    resize(); init(); draw();
    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt); rt = setTimeout(() => { cancelAnimationFrame(raf); resize(); init(); draw(); }, 200);
    });
  }

  /* ── 3. NAVBAR ─────────────────────────────────── */
  const navbar    = document.getElementById('navbar');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks  = document.getElementById('nav-links');

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
    updateActive();
    document.getElementById('back-to-top').classList.toggle('visible', window.scrollY > 450);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── 4. MOBILE MENU ─────────────────────────── */
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  /* ── 5. ACTIVE NAV ─────────────────────────── */
  const sections   = Array.from(document.querySelectorAll('section[id]'));
  const navAnchors = Array.from(navLinks.querySelectorAll('a'));
  function updateActive() {
    const y = window.scrollY + 120;
    let cur = '';
    sections.forEach(s => { if (y >= s.offsetTop) cur = s.id; });
    navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${cur}`));
  }

  /* ── 6. SMOOTH SCROLL (navbar offset) ─────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight - 12, behavior: 'smooth' });
    });
  });

  /* ── 7. SKILL BARS ─────────────────────────── */
  const fills = document.querySelectorAll('.sk-fill');

  function animateBars() {
    fills.forEach(f => { f.style.width = f.dataset.w + '%'; });
  }

  if ('IntersectionObserver' in window) {
    // Observe the skills section, not individual tiny bars
    const skillsSection = document.getElementById('skills');
    if (skillsSection) {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            animateBars();
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.05 });
      obs.observe(skillsSection);
    } else {
      animateBars();
    }
  } else {
    animateBars();
  }
  // Hard fallback: animate after 3s regardless
  setTimeout(animateBars, 3000);

  /* ── 8. PROJECT CARD TILT ─────────────────── */
  if (!window.matchMedia('(hover:none)').matches) {
    document.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r  = card.getBoundingClientRect();
        const rx = ((e.clientY - r.top  - r.height/2) / (r.height/2)) * -5;
        const ry = ((e.clientX - r.left - r.width/2)  / (r.width/2))  *  5;
        card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => card.style.transform = '');
    });
  }

  /* ── 9. BACK TO TOP ────────────────────────── */
  document.getElementById('back-to-top').addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  );


});
