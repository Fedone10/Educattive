(() => {
  'use strict';

  const mqMobile = window.matchMedia('(max-width: 759.98px)');
  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isMobile = () => mqMobile.matches;
  // Sticky header height: marquee + chapter nav (80 desktop / 88 mobile, scaled on wide screens)
  const hdrEls = document.querySelectorAll('.topbar > .marquee, .chapnav');
  const hdr = () => Array.from(hdrEls).reduce((h, el) => h + el.offsetHeight, 0) || (isMobile() ? 88 : 80);

  /* ---------- Marquees ---------- */
  document.querySelectorAll('[data-marquee]').forEach((track) => {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 24; i++) { // two identical halves → seamless translateX(-50%) loop
      const s = document.createElement('span');
      s.className = 'marquee__item';
      s.textContent = 'MANIFESTO EDUC.ATTIVE';
      frag.appendChild(s);
    }
    track.appendChild(frag);
  });

  /* ---------- Smooth scroll to chapters ---------- */
  const scrollBehavior = () => (mqReduce.matches ? 'auto' : 'smooth');

  function goTo(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - hdr() + 2;
    window.scrollTo({ top, behavior: scrollBehavior() });
    if (history.replaceState) history.replaceState(null, '', '#' + id);
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-go]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    goTo(a.dataset.go);
  });

  const topBtn = document.querySelector('[data-top]');
  if (topBtn) topBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: scrollBehavior() });
    if (history.replaceState) history.replaceState(null, '', location.pathname + location.search);
  });

  /* ---------- Reveal on scroll (one-shot) ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting || en.boundingClientRect.top < window.innerHeight - 40) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Scroll state: nav visibility, progress, active chapter/module ---------- */
  const navs = document.querySelectorAll('.chapnav');
  const bars = document.querySelectorAll('[data-progress]');
  const heroes = document.querySelectorAll('[data-hero]');
  const chapters = document.querySelectorAll('[data-chap]');
  const mods = document.querySelectorAll('[data-m]');
  const navLinks = document.querySelectorAll('.chapnav [data-go]');
  const ticks = document.querySelectorAll('[data-tick]');
  const chipRow = document.querySelector('[data-chips]');

  let state = { nav: null, chap: undefined, mod: undefined };
  let raf = 0;

  const visibleHero = () => Array.from(heroes).find((h) => h.offsetParent !== null || h.offsetHeight > 0);
  const crossing = (el, line) => { const r = el.getBoundingClientRect(); return r.top <= line && r.bottom > line; };

  function measure() {
    raf = 0;
    const st = window.scrollY;
    const vh = window.innerHeight;
    const hero = visibleHero();
    const nav = hero ? st > hero.offsetHeight * 0.6 : true;

    const max = document.documentElement.scrollHeight - vh;
    const pct = (max > 0 ? Math.min(1, st / max) * 100 : 0) + '%';
    bars.forEach((b) => { b.style.width = pct; });

    let chap = null, mod = null;
    if (nav) {
      const line = hdr() + (vh - hdr()) * 0.35;
      chapters.forEach((el) => { if (crossing(el, line)) chap = el.dataset.chap; });
      mods.forEach((el) => { if (crossing(el, line)) mod = el.dataset.m; });
    }

    if (nav !== state.nav) {
      navs.forEach((n) => n.classList.toggle('is-visible', nav));
    }
    if (chap !== state.chap) {
      navLinks.forEach((a) => {
        const on = a.dataset.go === chap;
        a.classList.toggle('is-active', on);
        if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
      });
      scrollChips();
    }
    if (mod !== state.mod) {
      ticks.forEach((t) => t.classList.toggle('is-active', t.dataset.tick === mod));
    }
    state = { nav, chap, mod };
  }

  function scrollChips() {
    if (!chipRow || !isMobile()) return;
    const a = chipRow.querySelector('.is-active');
    if (a) chipRow.scrollTo({ left: Math.max(0, a.offsetLeft - 12), behavior: scrollBehavior() });
  }

  const schedule = () => { if (!raf) raf = requestAnimationFrame(measure); };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);

  /* ---------- Mobile hero: fit "MANIFESTO" to the width minus 40px ---------- */
  const fitTitle = document.querySelector('[data-fit-title]');
  const fitWord = document.querySelector('[data-fit]');
  function fit() {
    if (!fitTitle || !fitWord || !isMobile()) return;
    const fs = parseFloat(getComputedStyle(fitTitle).fontSize);
    if (!fs || !fitWord.offsetWidth) return;
    const ratio = fitWord.offsetWidth / fs;
    const size = Math.floor((document.documentElement.clientWidth - 40) / ratio);
    if (Math.abs(size - fs) >= 1) fitTitle.style.fontSize = size + 'px';
  }

  /* ---------- Mobile hero video: load on mobile only, never with sound ---------- */
  const video = document.querySelector('[data-video]');
  function forceMute() {
    if (!video) return;
    video.defaultMuted = true;
    video.muted = true;
    video.volume = 0;
    video.setAttribute('muted', '');
  }
  function syncVideo() {
    if (!video) return;
    if (isMobile()) {
      forceMute();
      if (!video.getAttribute('src')) {
        video.src = video.dataset.src;
        video.preload = 'auto';
      }
      if (!mqReduce.matches) {
        video.autoplay = true;
        const p = video.play();
        if (p && p.catch) p.catch(() => {});
      }
    } else if (!video.paused) {
      video.pause();
    }
  }
  if (video) {
    video.addEventListener('volumechange', () => { if (!video.muted || video.volume > 0) forceMute(); });
    video.addEventListener('play', forceMute);
  }

  function onLayoutChange() {
    fit();
    syncVideo();
    state.nav = null; state.chap = undefined; state.mod = undefined;
    schedule();
  }
  if (mqMobile.addEventListener) mqMobile.addEventListener('change', onLayoutChange);
  else if (mqMobile.addListener) mqMobile.addListener(onLayoutChange);
  window.addEventListener('resize', fit);

  onLayoutChange();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { fit(); setTimeout(fit, 500); });
  }
})();
