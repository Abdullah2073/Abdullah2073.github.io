/* =====================================================
   ABDULLAH PORTFOLIO — script.js (final clean build)
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* 1. LOADER — hide after page loads */
  const loader = document.getElementById('loader');
  function hideLoader() {
    loader.classList.add('hidden');
  }
  if (document.readyState === 'complete') {
    setTimeout(hideLoader, 700);
  } else {
    window.addEventListener('load', () => setTimeout(hideLoader, 700));
  }
  setTimeout(hideLoader, 2500); // hard fallback

  /* 2. BACKGROUND CANVAS */
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, nodes, raf;
    const MAX = 130;
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    const init   = () => {
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
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < MAX) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(0,212,255,${(1 - d / MAX) * .11})`;
            ctx.lineWidth = .6;
            ctx.stroke();
          }
        }
        ctx.beginPath();
        ctx.arc(nodes[i].x, nodes[i].y, nodes[i].r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,212,255,0.18)';
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    resize(); init(); draw();
    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => { cancelAnimationFrame(raf); resize(); init(); draw(); }, 200);
    });
  }

  /* 3. NAVBAR scroll effect */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    navbar.classList.toggle('sc', window.scrollY > 30);
    updateActive();
    const btn = document.getElementById('back-top');
    if (btn) btn.classList.toggle('show', window.scrollY > 450);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* 4. MOBILE MENU */
  const navToggle = document.getElementById('nav-toggle');
  const navLinks  = document.getElementById('nav-links');
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.classList.toggle('op', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('op');
    document.body.style.overflow = '';
  }));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      navLinks.classList.remove('open');
      navToggle.classList.remove('op');
      document.body.style.overflow = '';
    }
  });

  /* 5. ACTIVE NAV LINK */
  const sections   = Array.from(document.querySelectorAll('section[id]'));
  const navAnchors = Array.from(navLinks.querySelectorAll('a'));
  function updateActive() {
    const y = window.scrollY + 120;
    let cur = '';
    sections.forEach(s => { if (y >= s.offsetTop) cur = s.id; });
    navAnchors.forEach(a => a.classList.toggle('ac', a.getAttribute('href') === `#${cur}`));
  }

  /* 6. SMOOTH SCROLL with navbar offset */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight - 12,
        behavior: 'smooth'
      });
    });
  });

  /* 7. BACK TO TOP */
  const backTop = document.getElementById('back-top');
  if (backTop) backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* 8. PROJECT CARD 3D TILT (desktop only) */
  if (!window.matchMedia('(hover: none)').matches) {
    document.querySelectorAll('.proj-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r  = card.getBoundingClientRect();
        const rx = ((e.clientY - r.top  - r.height / 2) / (r.height / 2)) * -5;
        const ry = ((e.clientX - r.left - r.width  / 2) / (r.width  / 2)) *  5;
        card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

});
