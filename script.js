/* =====================================================
   ABDULLAH PORTFOLIO — script.js  v5
   Scroll reveal, canvas, navbar, interactions
   ===================================================== */

/* ── 1. LOADER ── */
const loader = document.getElementById('loader');
function hideLoader() { if (loader) loader.classList.add('hidden'); }
if (document.readyState === 'complete') { setTimeout(hideLoader, 700); }
else { window.addEventListener('load', () => setTimeout(hideLoader, 700)); }
setTimeout(hideLoader, 2500);

document.addEventListener('DOMContentLoaded', () => {

  /* ── 2. BACKGROUND CANVAS ── */
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, nodes, raf;
    const MAX = 130;
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    const init = () => {
      const n = Math.min(Math.floor(W * H / 16000), 80);
      nodes = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .28, vy: (Math.random() - .5) * .28,
        r: Math.random() * 1.4 + .5
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
          const d = Math.sqrt(dx*dx + dy*dy);
          if (d < MAX) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(0,212,255,${(1-d/MAX)*.11})`;
            ctx.lineWidth = .6;
            ctx.stroke();
          }
        }
        ctx.beginPath();
        ctx.arc(nodes[i].x, nodes[i].y, nodes[i].r, 0, Math.PI*2);
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

  /* ── 3. SCROLL REVEAL (IntersectionObserver) ── */
  const srItems = document.querySelectorAll('.sr');
  if (srItems.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          observer.unobserve(e.target); // fire once
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    srItems.forEach(el => observer.observe(el));
  }

  /* ── 4. NAVBAR SCROLL EFFECT ── */
  const navbar = document.getElementById('navbar');
  const backTopBtn = document.getElementById('back-top');
  const onScroll = () => {
    navbar.classList.toggle('sc', window.scrollY > 30);
    if (backTopBtn) backTopBtn.classList.toggle('show', window.scrollY > 450);
    updateActive();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── 5. MOBILE MENU ── */
  const navToggle = document.getElementById('nav-toggle');
  const navLinks  = document.getElementById('nav-links');
  function closeMobileMenu() {
    navLinks.classList.remove('open');
    navToggle.classList.remove('op');
    document.body.style.overflow = '';
  }
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.classList.toggle('op', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMobileMenu(); });
  // Close on overlay backdrop click (outside the links)
  navLinks.addEventListener('click', e => { if (e.target === navLinks) closeMobileMenu(); });

  /* ── 6. ACTIVE NAV LINK ── */
  const sections   = Array.from(document.querySelectorAll('section[id]'));
  const navAnchors = Array.from(navLinks.querySelectorAll('a'));
  function updateActive() {
    const y = window.scrollY + 140;
    let cur = '';
    sections.forEach(s => { if (y >= s.offsetTop) cur = s.id; });
    navAnchors.forEach(a => a.classList.toggle('ac', a.getAttribute('href') === `#${cur}`));
  }

  /* ── 7. SMOOTH SCROLL ── */
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

  /* ── 8. BACK TO TOP ── */
  if (backTopBtn) backTopBtn.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));

  /* ── 9. PROJECT CARD 3D TILT (desktop only) ── */
  if (!window.matchMedia('(hover: none)').matches) {
    document.querySelectorAll('.proj-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r  = card.getBoundingClientRect();
        const rx = ((e.clientY - r.top  - r.height/2) / (r.height/2)) * -5;
        const ry = ((e.clientX - r.left - r.width /2) / (r.width /2)) *  5;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ── 10. SKILL CHIP STAGGER MICRO-INTERACTION ── */
  document.querySelectorAll('.chip-grid').forEach(grid => {
    const chips = grid.querySelectorAll('span');
    chips.forEach((chip, i) => {
      chip.style.transitionDelay = `${i * 20}ms`;
    });
    grid.parentElement.addEventListener('mouseenter', () => {
      chips.forEach(c => c.classList.add('hovered'));
    });
    grid.parentElement.addEventListener('mouseleave', () => {
      chips.forEach(c => c.classList.remove('hovered'));
    });
  });

  /* ── 11. FOOTER TECH CHIP STAGGER ── */
  const ftTechChips = document.querySelectorAll('.ft-tech');
  if (ftTechChips.length) {
    const ftObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          ftTechChips.forEach((chip, i) => {
            setTimeout(() => {
              chip.style.opacity = '1';
              chip.style.transform = 'translateY(0)';
            }, i * 55);
          });
          ftObserver.disconnect();
        }
      });
    }, { threshold: 0.2 });
    const ftGrid = document.querySelector('.ft-tech-grid');
    if (ftGrid) {
      ftTechChips.forEach(chip => {
        chip.style.opacity = '0';
        chip.style.transform = 'translateY(10px)';
        chip.style.transition = 'opacity .4s ease, transform .4s ease, color .25s, border-color .25s, background .25s, box-shadow .25s';
      });
      ftObserver.observe(ftGrid);
    }
  }

  /* ── 12. FOOTER NAV LINK STAGGER ── */
  const ftNavLinks = document.querySelectorAll('.ft-nav-list a');
  if (ftNavLinks.length) {
    const ftNavObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          ftNavLinks.forEach((link, i) => {
            setTimeout(() => {
              link.style.opacity = '1';
              link.style.transform = 'translateX(0)';
            }, i * 60);
          });
          ftNavObs.disconnect();
        }
      });
    }, { threshold: 0.2 });
    ftNavLinks.forEach(link => {
      link.style.opacity = '0';
      link.style.transform = 'translateX(-10px)';
      link.style.transition = 'opacity .4s ease, transform .4s ease, color .2s, background .2s, padding-left .2s';
    });
    const ftNav = document.querySelector('.ft-nav-list');
    if (ftNav) ftNavObs.observe(ftNav);
  }

});