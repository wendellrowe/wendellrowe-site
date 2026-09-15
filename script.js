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

  const inquiry = document.querySelector('[data-inquiry]');
  if (inquiry instanceof HTMLFormElement) {
    const submit = inquiry.querySelector('.inquiry-submit');
    const status = inquiry.querySelector('[data-inquiry-status]');
    const fallbackLink = inquiry.querySelector('[data-inquiry-fallback]');
    const fallbackMail = (data) => {
      const purpose = String(data.get('purpose') || 'Inquiry');
      const body = encodeURIComponent([
        `Name: ${data.get('name') || ''}`,
        `Organization: ${data.get('organization') || ''}`,
        `Email: ${data.get('email') || ''}`,
        `Purpose: ${purpose}`, '', String(data.get('message') || '')
      ].join('\n'));
      if (fallbackLink) {
        fallbackLink.href = `mailto:hello@wendellrowe.com?subject=${encodeURIComponent(`Strategic conversation — ${purpose}`)}&body=${body}`;
        fallbackLink.hidden = false;
      }
    };
    inquiry.addEventListener('submit', async (event) => {
      event.preventDefault();
      const data = new FormData(inquiry);
      if (fallbackLink) fallbackLink.hidden = true;
      if (submit) { submit.disabled = true; submit.querySelector('span').textContent = 'Sending'; }
      if (status) { status.textContent = 'Sending your inquiry…'; status.dataset.state = 'sending'; }
      try {
        const response = await fetch('/api/inquiry', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(Object.fromEntries(data)) });
        if (response.ok) { inquiry.reset(); if (status) { status.textContent = 'Your inquiry has been sent. Thank you.'; status.dataset.state = 'success'; } }
        else if (response.status === 503) {
          if (status) { status.textContent = 'Your message has not been sent. Use Open email draft below to send it from your email app, or email hello@wendellrowe.com directly.'; status.dataset.state = 'error'; }
          fallbackMail(data);
        }
        else throw new Error('delivery');
      } catch {
        if (status) { status.textContent = 'Your message has not been sent. Use Open email draft below, or email hello@wendellrowe.com directly.'; status.dataset.state = 'error'; }
        fallbackMail(data);
      }
      finally { if (submit) { submit.disabled = false; submit.querySelector('span').textContent = 'Send inquiry'; } }
    });
  }

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
    document.querySelector(link.getAttribute('href'))?.focus({ preventScroll: true });
  }));

  const closeMenu = () => {
    menuToggle?.setAttribute('aria-expanded', 'false');
    nav?.classList.remove('is-open');
    body.classList.remove('menu-open');
  };
  nav?.querySelectorAll('a[href^="#"]').forEach(link => {
    document.querySelector(link.getAttribute('href'))?.setAttribute('tabindex', '-1');
  });
  document.addEventListener('keydown', event => {
    if (menuToggle?.getAttribute('aria-expanded') !== 'true') return;
    if (event.key === 'Escape') {
      closeMenu();
      menuToggle.focus();
    }
    if (event.key === 'Tab') {
      const controls = [menuToggle, ...nav.querySelectorAll('a')];
      const index = controls.indexOf(document.activeElement);
      if (event.shiftKey && index <= 0) {
        event.preventDefault(); controls.at(-1).focus();
      } else if (!event.shiftKey && (index === controls.length - 1 || index < 0)) {
        event.preventDefault(); controls[0].focus();
      }
    }
  });
  window.matchMedia('(max-width: 1100px)').addEventListener('change', closeMenu);

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

  const soundPlayer = document.querySelector('[data-sound-player]');
  const soundtrack = document.getElementById('site-soundtrack');
  const soundToggle = document.querySelector('[data-sound-toggle]');
  const soundStatus = document.querySelector('[data-sound-status]');
  const soundExpand = document.querySelector('[data-sound-expand]');
  const soundSeek = document.querySelector('[data-sound-seek]');
  const soundVolume = document.querySelector('[data-sound-volume]');
  const soundMute = document.querySelector('[data-sound-mute]');
  const soundCurrent = document.querySelector('[data-sound-current]');
  const soundDuration = document.querySelector('[data-sound-duration]');
  const soundRing = document.querySelector('[data-sound-ring]');
  const soundWave = document.querySelector('[data-sound-wave]');

  if (soundPlayer && soundtrack instanceof HTMLAudioElement && soundToggle && soundStatus) {
    const CIRC = 2 * Math.PI * 46;
    if (soundRing instanceof SVGCircleElement) {
      soundRing.style.strokeDasharray = String(CIRC);
      soundRing.style.strokeDashoffset = String(CIRC);
    }

    const rawVolume = sessionStorage.getItem('wr-volume');
    const storedVolume = rawVolume == null ? Number.NaN : Number(rawVolume);
    soundtrack.volume = Number.isFinite(storedVolume) ? storedVolume : .22;
    if (soundVolume instanceof HTMLInputElement) {
      soundVolume.value = String(Math.round(soundtrack.volume * 100));
    }

    const formatTime = (value) => {
      if (!Number.isFinite(value)) return '0:00';
      const minutes = Math.floor(value / 60);
      const seconds = Math.floor(value % 60).toString().padStart(2, '0');
      return `${minutes}:${seconds}`;
    };

    const setSoundState = (state, label, pressed = false) => {
      soundPlayer.dataset.state = state;
      const copy = {
        ready: 'Play soundscape',
        playing: 'Now playing',
        paused: 'Paused',
        error: 'Tap to retry'
      }[state] || 'Soundscape';
      soundStatus.textContent = copy;
      soundToggle.setAttribute('aria-label', label);
      soundToggle.setAttribute('aria-pressed', String(pressed));
    };

    let audioCtx = null;
    let analyser = null;
    let freqData = null;

    const setupGraph = async () => {
      if (audioCtx || !(soundWave instanceof HTMLCanvasElement)) return;
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) return;
      audioCtx = new Context();
      const sourceNode = audioCtx.createMediaElementSource(soundtrack);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = .78;
      sourceNode.connect(analyser);
      analyser.connect(audioCtx.destination);
      freqData = new Uint8Array(analyser.frequencyBinCount);
    };

    const paintWave = (timeStamp) => {
      if (!(soundWave instanceof HTMLCanvasElement)) return;
      const ctx = soundWave.getContext('2d');
      if (!ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = soundWave.clientWidth || 268;
      const height = soundWave.clientHeight || 36;
      if (soundWave.width !== Math.floor(width * dpr) || soundWave.height !== Math.floor(height * dpr)) {
        soundWave.width = Math.floor(width * dpr);
        soundWave.height = Math.floor(height * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const bars = 40;
      const gap = 2;
      const barWidth = Math.max(1.6, (width - gap * (bars - 1)) / bars);
      if (analyser && freqData && !soundtrack.paused) analyser.getByteFrequencyData(freqData);
      for (let i = 0; i < bars; i += 1) {
        const sample = freqData ? freqData[Math.floor(i * (freqData.length / bars))] / 255 : 0;
        const idle = .14 + .1 * Math.sin(i * .42 + timeStamp / 640);
        const amp = soundtrack.paused ? idle : Math.max(.08, sample);
        const barHeight = Math.max(3, amp * height);
        ctx.fillStyle = `rgba(198, 167, 94, ${.25 + amp * .75})`;
        ctx.fillRect(i * (barWidth + gap), (height - barHeight) / 2, barWidth, barHeight);
      }
    };

    const setRangeFill = (input, value, max) => {
      if (!(input instanceof HTMLInputElement)) return;
      input.style.setProperty('--fill', `${(value / max) * 100}%`);
    };

    const syncTransport = (timeStamp) => {
      const duration = soundtrack.duration || 0;
      const current = soundtrack.currentTime || 0;
      if (soundCurrent) soundCurrent.textContent = formatTime(current);
      if (soundDuration) soundDuration.textContent = formatTime(duration);
      if (soundSeek instanceof HTMLInputElement && document.activeElement !== soundSeek) {
        soundSeek.value = duration ? String(Math.round((current / duration) * 1000)) : '0';
        setRangeFill(soundSeek, Number(soundSeek.value), 1000);
      }
      if (soundVolume instanceof HTMLInputElement) setRangeFill(soundVolume, Number(soundVolume.value), 100);
      if (soundRing instanceof SVGCircleElement) {
        soundRing.style.strokeDashoffset = String(CIRC * (1 - (duration ? current / duration : 0)));
      }
      paintWave(timeStamp);
      requestAnimationFrame(syncTransport);
    };
    requestAnimationFrame(syncTransport);

    const playSoundtrack = async () => {
      try {
        await setupGraph();
        await audioCtx?.resume();
        await soundtrack.play();
        sessionStorage.setItem('wr-soundtrack', 'on');
        setSoundState('playing', 'Pause website soundtrack', true);
        if ('mediaSession' in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: 'Frames of History',
            artist: 'Rowe Meridian Group℠',
            album: 'Wendell Rowe'
          });
          navigator.mediaSession.playbackState = 'playing';
        }
      } catch {
        sessionStorage.setItem('wr-soundtrack', 'off');
        setSoundState('error', 'Play website soundtrack');
      }
    };

    const pauseSoundtrack = (resumeLabel = false) => {
      soundtrack.pause();
      sessionStorage.setItem('wr-soundtrack', 'off');
      setSoundState('paused', 'Play website soundtrack');
      if (resumeLabel) soundStatus.textContent = 'Resume sound';
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
    };

    soundToggle.addEventListener('click', () => {
      if (soundtrack.paused) playSoundtrack();
      else pauseSoundtrack();
    });

    soundExpand?.addEventListener('click', (event) => {
      event.preventDefault();
      const open = soundPlayer.dataset.open === 'true';
      soundPlayer.dataset.open = String(!open);
      soundExpand.setAttribute('aria-expanded', String(!open));
      soundExpand.setAttribute('aria-label', open ? 'Open soundtrack details' : 'Close soundtrack details');
    });

    document.addEventListener('pointerdown', (event) => {
      if (soundPlayer.dataset.open !== 'true') return;
      if (!(event.target instanceof Node) || soundPlayer.contains(event.target)) return;
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
      soundPlayer.dataset.open = 'false';
      soundExpand?.setAttribute('aria-expanded', 'false');
    });


    soundSeek?.addEventListener('input', () => {
      if (!(soundSeek instanceof HTMLInputElement) || !soundtrack.duration) return;
      soundtrack.currentTime = (Number(soundSeek.value) / 1000) * soundtrack.duration;
      setRangeFill(soundSeek, Number(soundSeek.value), 1000);
    });

    soundVolume?.addEventListener('input', () => {
      if (!(soundVolume instanceof HTMLInputElement)) return;
      soundtrack.volume = Number(soundVolume.value) / 100;
      soundtrack.muted = soundtrack.volume === 0;
      sessionStorage.setItem('wr-volume', String(soundtrack.volume));
      soundMute?.setAttribute('aria-pressed', String(soundtrack.muted));
      setRangeFill(soundVolume, Number(soundVolume.value), 100);
    });

    soundMute?.addEventListener('click', () => {
      soundtrack.muted = !soundtrack.muted;
      soundMute.setAttribute('aria-pressed', String(soundtrack.muted));
      soundMute.setAttribute('aria-label', soundtrack.muted ? 'Unmute soundtrack' : 'Mute soundtrack');
    });

    soundtrack.addEventListener('loadedmetadata', () => {
      if (soundDuration) soundDuration.textContent = formatTime(soundtrack.duration);
    });

    soundtrack.addEventListener('error', () => {
      soundtrack.pause();
      setSoundState('error', 'Soundtrack unavailable');
      soundStatus.textContent = 'Unavailable';
    });

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden || soundtrack.paused) return;
      pauseSoundtrack(true);
    });

    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => { playSoundtrack(); });
      navigator.mediaSession.setActionHandler('pause', () => { pauseSoundtrack(); });
    }

    const wantsSound = sessionStorage.getItem('wr-soundtrack') === 'on';
    setSoundState('ready', wantsSound ? 'Resume website soundtrack' : 'Play website soundtrack');
    if (wantsSound) soundStatus.textContent = 'Resume sound';
  }


  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));

  const progress = document.querySelector('.scroll-progress');
  const updateProgress = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  };
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });

  const countEls = document.querySelectorAll('[data-count]');
  if (countEls.length) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        if (reduceMotion || Number.isNaN(target)) {
          el.textContent = target.toLocaleString() + suffix;
          countObserver.unobserve(el);
          return;
        }
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min(1, (now - start) / 1100);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(target * eased).toLocaleString() + suffix;
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        countObserver.unobserve(el);
      });
    }, { threshold: 0.4 });
    countEls.forEach(el => countObserver.observe(el));
  }

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

    const ctaMotionReference = document.querySelector('.hero .primary-cta') || document.querySelector('.primary-cta');
    document.querySelectorAll('.magnetic').forEach(el => {
      const isCta = el.classList.contains('primary-cta');
      let shiftX = 0, shiftY = 0;
      el.addEventListener('mousemove', (event) => {
        const rect = el.getBoundingClientRect();
        if (isCta && ctaMotionReference) {
          // Measure from the resting box so the button cannot chase its own movement.
          const x = (event.clientX - (rect.left - shiftX)) / rect.width - .5;
          const y = (event.clientY - (rect.top - shiftY)) / rect.height - .5;
          // All CTAs share the hero button's travel, regardless of their label or size.
          shiftX = Math.max(-.5, Math.min(.5, x)) * ctaMotionReference.offsetWidth * .12;
          shiftY = Math.max(-.5, Math.min(.5, y)) * ctaMotionReference.offsetHeight * .12;
          el.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
        } else {
          const x = event.clientX - rect.left - rect.width / 2;
          const y = event.clientY - rect.top - rect.height / 2;
          el.style.transform = `translate(${x * .12}px, ${y * .12}px)`;
        }
      });
      el.addEventListener('mouseleave', () => {
        shiftX = 0;
        shiftY = 0;
        el.style.transform = '';
      });
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
