/* BizAI landing page interactions. Everything shown is illustrative demo data. */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const backToTop = document.querySelector('.back-to-top');

  function closeMenu() {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open menu');
    mobileNav.classList.remove('open');
    mobileNav.inert = true;
  }

  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeMenu();
    } else {
      menuButton.setAttribute('aria-expanded', 'true');
      menuButton.setAttribute('aria-label', 'Close menu');
      mobileNav.inert = false;
      mobileNav.classList.add('open');
    }
  });
  mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) closeMenu();
  });
  window.matchMedia('(min-width: 801px)').addEventListener('change', event => {
    if (event.matches) closeMenu();
  });

  // Native anchor scrolling respects the user's reduced-motion preference via CSS.
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'instant' : 'smooth' }));
  const updateBackToTop = () => backToTop.classList.toggle('visible', window.scrollY > 600);
  window.addEventListener('scroll', updateBackToTop, { passive: true });
  updateBackToTop();

  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px 45px 0px' });
    revealElements.forEach(element => revealObserver.observe(element));
  } else {
    revealElements.forEach(element => element.classList.add('is-visible'));
  }

  // Demonstration figures count upward only when the dashboard enters view.
  const counters = document.querySelectorAll('[data-count]');
  function animateCounter(element) {
    const target = Number(element.dataset.count);
    const prefix = element.dataset.prefix || '';
    if (reduceMotion) {
      element.textContent = prefix + target.toLocaleString('en-US');
      return;
    }
    const start = performance.now();
    const duration = 1300;
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = prefix + Math.round(target * eased).toLocaleString('en-US');
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window) {
    const countObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(counter => countObserver.observe(counter));
  } else {
    counters.forEach(animateCounter);
  }

  // Local, hard-coded sample datasets; switching periods is not connected to any account.
  const chartData = {
    week: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], values: [42, 61, 49, 77, 58, 88, 72], caption: 'Sample daily sales · this week' },
    month: { labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], values: [47, 65, 81, 73], caption: 'Sample weekly sales · this month' }
  };
  const chartBars = document.getElementById('chart-bars');
  const chartArea = document.getElementById('sales-chart');
  const chartCaption = document.getElementById('chart-caption');
  const periodButtons = document.querySelectorAll('.chart-period');
  function renderChart(period) {
    const data = chartData[period];
    chartBars.replaceChildren();
    data.labels.forEach((label, index) => {
      const group = document.createElement('div');
      group.className = 'chart-bar-group';
      const bar = document.createElement('div');
      bar.className = 'chart-bar';
      bar.style.setProperty('--bar-height', `${data.values[index]}%`);
      bar.dataset.value = `$${(data.values[index] * 90).toLocaleString('en-US')}`;
      bar.title = `${label}: illustrative sales ${bar.dataset.value}`;
      const caption = document.createElement('span');
      caption.className = 'chart-bar-label';
      caption.textContent = label;
      group.append(bar, caption);
      chartBars.append(group);
    });
    chartArea.setAttribute('aria-label', `Illustrative ${period === 'week' ? 'daily' : 'weekly'} sales bar chart; sample data only`);
    chartCaption.textContent = data.caption;
    periodButtons.forEach(button => {
      const active = button.dataset.period === period;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }
  periodButtons.forEach(button => button.addEventListener('click', () => renderChart(button.dataset.period)));
  renderChart('week');

  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');
  const fields = [...form.querySelectorAll('input, textarea')];
  function validateField(field) {
    const value = field.value.trim();
    let error = '';
    if (!value) error = 'This field is required.';
    else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Enter a valid email address.';
    else if (value.length < Number(field.minLength || 0)) error = `Please enter at least ${field.minLength} characters.`;
    field.setAttribute('aria-invalid', String(Boolean(error)));
    document.getElementById(`${field.id}-error`).textContent = error;
    return !error;
  }
  fields.forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') validateField(field);
      feedback.hidden = true;
    });
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const results = fields.map(validateField);
    if (results.includes(false)) {
      feedback.hidden = true;
      fields[results.indexOf(false)].focus();
      return;
    }
    // Nothing is transmitted or stored. This confirmation is deliberately explicit.
    feedback.textContent = 'Demo confirmation: your form looks good. This is a prototype; your message was not sent or saved. Thank you for exploring BizAI!';
    feedback.hidden = false;
    form.reset();
    fields.forEach(field => field.removeAttribute('aria-invalid'));
  });

  document.getElementById('copyright-year').textContent = new Date().getFullYear();
})();
