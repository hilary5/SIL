/**
 * SafeConnect Investments Limited - Interactive Site Functionality
 * Author: Frontend Engineer & UI/UX Specialist
 */

/**
 * Utility: lightweight debounce to throttle high-frequency events
 * @param {Function} fn  - function to debounce
 * @param {number}   ms  - delay in milliseconds
 */
function debounce(fn, ms = 100) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();   // must run first to prevent theme flash
  initMobileNav();
  initHeaderScroll();
  initScrollReveal();
  initProjectFilters();
  initFormValidation();
  initSmoothScrollSpy();
});

/**
 * Light / Dark Theme Toggle with localStorage persistence
 */
function initThemeToggle() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  // Apply saved preference immediately (before paint)
  const saved = localStorage.getItem('sil-theme');
  if (saved === 'light') {
    document.body.classList.add('light-theme');
  }

  btn.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-theme');
    localStorage.setItem('sil-theme', isLight ? 'light' : 'dark');

    // Announce change for screen-readers
    btn.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
  });
}

/**
 * Mobile Navigation Toggle and Accessibility Controls
 */
function initMobileNav() {
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!navToggle || !navMenu) return;

  const toggleMenu = () => {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !isExpanded);
    navMenu.classList.toggle('open');
    document.body.classList.toggle('no-scroll');
  };

  navToggle.addEventListener('click', toggleMenu);

  // Close menu when clicking nav link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('open')) {
        toggleMenu();
      }
    });
  });
}

/**
 * Sticky Header and Style updates on scroll
 */
function initHeaderScroll() {
  const header = document.getElementById('header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scroll-nav');
    } else {
      header.classList.remove('scroll-nav');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/**
 * Scroll Reveal animations using IntersectionObserver
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.scroll-reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target); // Stop observing after animation triggers
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px' // Trigger slightly before element enters viewport
    });

    revealElements.forEach(element => {
      revealObserver.observe(element);
    });
  } else {
    // Fallback if IntersectionObserver is not supported
    revealElements.forEach(element => {
      element.classList.add('revealed');
    });
  }
}

/**
 * Interactive Project Category Filtering
 * Uses CSS classes (.is-fading / .is-hidden) instead of inline styles.
 */
function initProjectFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards  = document.querySelectorAll('.project-card');

  if (!filterButtons.length || !projectCards.length) return;

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const filter = button.getAttribute('data-filter');

      projectCards.forEach(card => {
        const matches = filter === 'all' || card.dataset.category === filter;

        // Step 1: fade out all
        card.classList.add('is-fading');

        setTimeout(() => {
          // Step 2: hide non-matching, show matching
          card.classList.toggle('is-hidden', !matches);
          card.classList.remove('is-fading');
        }, 260);
      });
    });
  });
}

/**
 * Custom Contact Form Validation and Mock Submission Flow
 */
function initFormValidation() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const inputs = {
    name: document.getElementById('formName'),
    email: document.getElementById('formEmail'),
    subject: document.getElementById('formSubject'),
    message: document.getElementById('formMessage')
  };

  const errors = {
    name: document.getElementById('nameError'),
    email: document.getElementById('emailError'),
    subject: document.getElementById('subjectError'),
    message: document.getElementById('messageError')
  };

  const formStatus = document.getElementById('formStatus');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateField = (field, condition) => {
    if (condition) {
      field.classList.remove('invalid');
      return true;
    } else {
      field.classList.add('invalid');
      return false;
    }
  };

  // Add keyup/change validation to clear error indicators immediately when corrected
  if (inputs.name) {
    inputs.name.addEventListener('input', () => validateField(inputs.name, inputs.name.value.trim() !== ''));
  }
  if (inputs.email) {
    inputs.email.addEventListener('input', () => validateField(inputs.email, emailRegex.test(inputs.email.value.trim())));
  }
  if (inputs.subject) {
    inputs.subject.addEventListener('change', () => validateField(inputs.subject, inputs.subject.value !== ''));
  }
  if (inputs.message) {
    inputs.message.addEventListener('input', () => validateField(inputs.message, inputs.message.value.trim() !== ''));
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Reset status message
    formStatus.style.display = 'none';
    formStatus.className = 'form-status';
    formStatus.textContent = '';

    // Validate all fields
    const isNameValid = validateField(inputs.name, inputs.name.value.trim() !== '');
    const isEmailValid = validateField(inputs.email, emailRegex.test(inputs.email.value.trim()));
    const isSubjectValid = validateField(inputs.subject, inputs.subject.value !== '');
    const isMessageValid = validateField(inputs.message, inputs.message.value.trim() !== '');

    const isFormValid = isNameValid && isEmailValid && isSubjectValid && isMessageValid;

    if (isFormValid) {
      const submitBtn = document.getElementById('submitBtn');
      const originalBtnText = submitBtn.textContent;
      
      // Visual feedback: sending...
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending Inquiry...';

      // Mock API post timeout
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;

        formStatus.classList.add('success');
        formStatus.textContent = `Thank you, ${inputs.name.value.split(' ')[0]}. Your inquiry has been sent to our Delta State & Lagos engineering offices.`;
        form.reset();
      }, 1500);

    } else {
      formStatus.classList.add('error');
      formStatus.textContent = 'Please correct the highlighted fields before sending.';
    }
  });
}

/**
 * Scrollspy: Highlights active nav item corresponding to visible section
 */
function initSmoothScrollSpy() {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link:not(.nav-btn)');

  if (sections.length === 0 || navLinks.length === 0) return;

  const spyScroll = debounce(() => {
    let currentSectionId = '';
    const scrollPosition = window.scrollY + window.innerHeight / 3;

    sections.forEach(section => {
      if (scrollPosition >= section.offsetTop &&
          scrollPosition < section.offsetTop + section.offsetHeight) {
        currentSectionId = section.id;
      }
    });

    if (currentSectionId) {
      navLinks.forEach(link => {
        const active = link.getAttribute('href') === `#${currentSectionId}`;
        link.classList.toggle('active', active);
      });
    }
  }, 80);

  window.addEventListener('scroll', spyScroll, { passive: true });
  spyScroll();
}
