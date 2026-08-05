(() => {
  const body = document.body;
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorRing = document.querySelector('.cursor-ring');
  const spotlight = document.querySelector('.spotlight');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.getElementById('year').textContent = new Date().getFullYear();

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('is-open', !open);
    body.classList.toggle('menu-open', !open);
  });

  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    menuToggle?.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
    body.classList.remove('menu-open');
  }));

  const navLinks = [...(nav?.querySelectorAll('a[href^="#"]') || [])];
  const navSections = navLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);
  const updateActiveNav = () => {
    const marker = window.scrollY + window.innerHeight * .32;
    let active = navSections[0];
    navSections.forEach(section => {
      if (section.offsetTop <= marker) active = section;
    });
    navLinks.forEach(link => {
      const isActive = link.getAttribute('href') === `#${active?.id}`;
      if (isActive) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  };
  updateActiveNav();
  window.addEventListener('scroll', updateActiveNav, { passive: true });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));

  if (!reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    let mouseX = -100, mouseY = -100, ringX = -100, ringY = -100;
    window.addEventListener('mousemove', (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
      spotlight.style.left = `${mouseX}px`;
      spotlight.style.top = `${mouseY}px`;
      spotlight.style.opacity = '1';
    });
    const renderCursor = () => {
      ringX += (mouseX - ringX) * .14;
      ringY += (mouseY - ringY) * .14;
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      requestAnimationFrame(renderCursor);
    };
    renderCursor();

    document.querySelectorAll('a, button, [data-tilt]').forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('is-active'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('is-active'));
    });

    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('mousemove', (event) => {
        const rect = el.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * .12}px, ${y * .12}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });

    document.querySelectorAll('[data-tilt]').forEach(card => {
      card.addEventListener('mousemove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.transform = `perspective(1100px) rotateX(${-y * 7}deg) rotateY(${x * 9}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1100px) rotateX(0deg) rotateY(0deg)';
      });
    });
  }

  const canvas = document.getElementById('constellation');
  if (!canvas || reduceMotion) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let width = 0, height = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(80, Math.floor(width / 20));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - .5) * .12,
      vy: (Math.random() - .5) * .12,
      r: Math.random() * 1.2 + .25
    }));
  }

  let animationFrameId = 0;

  function animate() {
    if (document.hidden) return;
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
      ctx.beginPath();
      ctx.fillStyle = 'rgba(198, 167, 94, .42)';
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(198, 167, 94, ${.07 * (1 - dist / 120)})`;
          ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
    });
    animationFrameId = requestAnimationFrame(animate);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationFrameId);
      return;
    }
    animationFrameId = requestAnimationFrame(animate);
  });

  resize();
  animate();
  window.addEventListener('resize', resize, { passive: true });
})();
