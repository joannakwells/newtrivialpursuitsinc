/* ============================================================
   TRIVIAL PURSUITS INC. — main.js
   Nav scroll · Mobile menu · Reveal animations ·
   Work filters · Hero parallax · Contact form
   ============================================================ */

(function () {
  'use strict';

  /* ── Helpers ── */
  const qs  = (s, ctx) => (ctx || document).querySelector(s);
  const qsa = (s, ctx) => (ctx || document).querySelectorAll(s);

  /* ── Navigation Scroll Behavior ── */
  const nav = qs('#nav');
  const isLightPage = document.body.classList.contains('page--light');

  function updateNav() {
    if (!nav) return;
    if (window.scrollY > 24) {
      nav.classList.add('nav--scrolled');
    } else if (!isLightPage) {
      nav.classList.remove('nav--scrolled');
    }
  }

  if (nav) {
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();
    // Light pages always keep white nav
    if (isLightPage) nav.classList.add('nav--scrolled');
  }

  /* ── Mobile Menu ── */
  const navToggle = qs('#navToggle');
  const navLinks  = qs('#navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      nav.classList.toggle('nav--open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) {
        nav.classList.add('nav--scrolled');
      } else if (!isLightPage && window.scrollY <= 24) {
        nav.classList.remove('nav--scrolled');
      }
    });

    // Close when a link is clicked
    qsa('a', navLinks).forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        nav.classList.remove('nav--open');
        navToggle.setAttribute('aria-expanded', 'false');
        if (!isLightPage && window.scrollY <= 24) {
          nav.classList.remove('nav--scrolled');
        }
      });
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!nav.contains(e.target) && navLinks.classList.contains('is-open')) {
        navLinks.classList.remove('is-open');
        nav.classList.remove('nav--open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── Highlight active nav link ── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  qsa('.nav__links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.style.opacity = '1';
      link.style.textDecoration = 'underline';
      link.style.textUnderlineOffset = '4px';
    }
  });

  /* ── Scroll Reveal — Intersection Observer ── */
  const reveals = qsa('.reveal');
  if (reveals.length > 0) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -32px 0px'
    });
    reveals.forEach(el => revealObs.observe(el));
  }

  /* ── Hero Background Eyes Parallax ── */
  const heroBgEyes = qs('.hero__bg-eyes');
  if (heroBgEyes) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      heroBgEyes.style.transform = `translateY(calc(-50% + ${y * 0.25}px))`;
    }, { passive: true });
  }

  /* ── Work Filter Tabs ── */
  const filterBtns = qsa('.filter-btn');
  const workCards  = qsa('.work-card');

  if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        workCards.forEach(card => {
          const cat = card.dataset.category;
          const show = filter === 'all' || cat === filter;
          card.style.display = show ? '' : 'none';
          // Re-trigger reveal for newly shown cards
          if (show) {
            setTimeout(() => card.classList.add('is-visible'), 10);
          }
        });
      });
    });
  }

  /* ── Contact Form ── */
  const contactForm = qs('#contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.textContent = 'Message sent.';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.55';
        submitBtn.style.transform = 'none';
        submitBtn.style.cursor = 'default';
      }
    });
  }

  /* ── Service card eye animation on scroll ── */
  const serviceEyes = qsa('.service-card .eye-icon');
  if (serviceEyes.length > 0) {
    const eyeObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animation = 'eye-pulse 3.5s ease-in-out infinite';
        } else {
          entry.target.style.animation = '';
        }
      });
    }, { threshold: 0.3 });
    serviceEyes.forEach(el => eyeObs.observe(el));
  }

})();
