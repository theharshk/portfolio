/**
 * Kumar Harsh — Portfolio Client Scripts
 * Pure vanilla JavaScript with zero external runtime dependencies.
 * Handles theme persistence, accessible navigation, abstract network canvas,
 * rotating hero text, expandable project case studies, and clipboard operations.
 */

(function () {
  'use strict';

  // Consolidated handler reference
  let updateCanvasRect = null;

  // -------------------------------------------------------------------------
  // 1. Theme Controller (Dark Charcoal default with Light Mode toggle)
  // -------------------------------------------------------------------------
  const THEME_KEY = 'kh_portfolio_theme';
  const root = document.documentElement;
  const themeToggleBtn = document.getElementById('theme-toggle');

  function getPreferredTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    // Respect system preference on initial load
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark'; // Dark charcoal is default
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
      if (themeToggleBtn) {
        themeToggleBtn.setAttribute('aria-label', 'Switch to dark theme');
        themeToggleBtn.setAttribute('title', 'Switch to dark theme');
      }
    } else {
      root.setAttribute('data-theme', 'dark');
      if (themeToggleBtn) {
        themeToggleBtn.setAttribute('aria-label', 'Switch to light theme');
        themeToggleBtn.setAttribute('title', 'Switch to light theme');
      }
    }
  }

  // Initialize theme
  const initialTheme = getPreferredTheme();
  applyTheme(initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function () {
      const currentTheme = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
      applyTheme(nextTheme);
      try {
        localStorage.setItem(THEME_KEY, nextTheme);
      } catch (e) {
        // Handle private browsing storage restrictions gracefully
      }
    });
  }

  // Listen for OS system theme changes if user hasn't explicitly set preference
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function (e) {
      if (!localStorage.getItem(THEME_KEY)) {
        applyTheme(e.matches ? 'light' : 'dark');
      }
    });
  }

  // -------------------------------------------------------------------------
  // 2. Mobile Navigation Toggle & Accessible Drawer
  // -------------------------------------------------------------------------
  const navToggleBtn = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  function closeMobileNav() {
    if (navMenu && navMenu.classList.contains('is-open')) {
      navMenu.classList.remove('is-open');
      if (navToggleBtn) {
        navToggleBtn.setAttribute('aria-expanded', 'false');
      }
    }
  }

  if (navToggleBtn && navMenu) {
    navToggleBtn.addEventListener('click', function () {
      const isExpanded = navToggleBtn.getAttribute('aria-expanded') === 'true';
      navToggleBtn.setAttribute('aria-expanded', String(!isExpanded));
      navMenu.classList.toggle('is-open', !isExpanded);
    });

    // Close on navigation link click
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        closeMobileNav();
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeMobileNav();
      }
    });

    // Close when clicking outside header
    document.addEventListener('click', function (e) {
      if (navMenu.classList.contains('is-open')) {
        const header = document.getElementById('header');
        if (header && !header.contains(e.target)) {
          closeMobileNav();
        }
      }
    });
  }

  // -------------------------------------------------------------------------
  // 3. Rotating Hero Subtitle Line
  // -------------------------------------------------------------------------
  const rotatingPhrases = [
    'backend systems',
    'full-stack applications',
    'AI agents',
    'real-time software'
  ];

  const rotatingEl = document.getElementById('rotating-text');
  let currentPhraseIdx = 0;
  const isReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (rotatingEl && !isReducedMotion) {
    setInterval(function () {
      rotatingEl.style.opacity = '0';
      rotatingEl.style.transform = 'translateY(4px)';

      setTimeout(function () {
        currentPhraseIdx = (currentPhraseIdx + 1) % rotatingPhrases.length;
        rotatingEl.textContent = rotatingPhrases[currentPhraseIdx];
        rotatingEl.style.opacity = '1';
        rotatingEl.style.transform = 'translateY(0)';
      }, 200);
    }, 3200);
  }

  // -------------------------------------------------------------------------
  // 4. Abstract Network Visualization Canvas (Restrained & System-Inspired)
  // -------------------------------------------------------------------------
  const canvas = document.getElementById('hero-canvas');
  if (canvas && !isReducedMotion) {
    const ctx = canvas.getContext('2d');
    const initialWidth = window.innerWidth;
    const initialHeight = window.innerHeight;
    const initialNodeCount = Math.max(16, Math.min(32, Math.floor(initialWidth / 45)));

    let width = initialWidth;
    let height = initialHeight;
    canvas.width = width;
    canvas.height = height;

    let animationFrameId = null;
    let isCanvasVisible = true;
    let nodeCount = initialNodeCount;

    // Node definitions representing system components
    const nodes = [];
    const mouse = { x: -1000, y: -1000, radius: 120 };

    class NetworkNode {
      constructor(w, h) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.radius = Math.random() * 1.5 + 1.5;
        this.pulse = Math.random() * Math.PI;
      }

      update(w, h) {
        this.x += this.vx;
        this.y += this.vy;
        this.pulse += 0.02;

        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;

        // Subtle mouse repulsion/interaction
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist < mouse.radius && dist > 0) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 1.2;
          this.y -= (dy / dist) * force * 1.2;
        }
      }

      draw() {
        const pulseFactor = 0.8 + Math.sin(this.pulse) * 0.25;
        const isLight = root.getAttribute('data-theme') === 'light';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * pulseFactor, 0, Math.PI * 2);
        ctx.fillStyle = isLight ? 'rgba(13, 148, 136, 0.45)' : 'rgba(20, 184, 166, 0.65)';
        ctx.fill();
      }
    }

    // Packet definitions (data traversing connections)
    const packets = [];
    class DataPacket {
      constructor(n1, n2) {
        this.n1 = n1;
        this.n2 = n2;
        this.progress = 0;
        this.speed = 0.008 + Math.random() * 0.012;
      }

      update() {
        this.progress += this.speed;
      }

      draw() {
        const px = this.n1.x + (this.n2.x - this.n1.x) * this.progress;
        const py = this.n1.y + (this.n2.y - this.n1.y) * this.progress;
        const isLight = root.getAttribute('data-theme') === 'light';

        ctx.beginPath();
        ctx.arc(px, py, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = isLight ? '#0d9488' : '#2dd4bf';
        ctx.fill();
      }
    }

    function initNetwork() {
      nodes.length = 0;
      packets.length = 0;
      for (let i = 0; i < nodeCount; i++) {
        nodes.push(new NetworkNode(width, height));
      }
    }

    function renderNetwork() {
      if (!isCanvasVisible) return;

      ctx.clearRect(0, 0, width, height);
      const isLight = root.getAttribute('data-theme') === 'light';
      const maxConnectDist = 160;

      // Draw node connections
      for (let i = 0; i < nodes.length; i++) {
        const nodeA = nodes[i];
        nodeA.update(width, height);
        nodeA.draw();

        for (let j = i + 1; j < nodes.length; j++) {
          const nodeB = nodes[j];
          const dist = Math.hypot(nodeA.x - nodeB.x, nodeA.y - nodeB.y);

          if (dist < maxConnectDist) {
            const alpha = (1 - dist / maxConnectDist) * (isLight ? 0.14 : 0.18);
            ctx.beginPath();
            ctx.moveTo(nodeA.x, nodeA.y);
            ctx.lineTo(nodeB.x, nodeB.y);
            ctx.strokeStyle = isLight
              ? `rgba(13, 148, 136, ${alpha})`
              : `rgba(20, 184, 166, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Randomly spawn data packet between linked nodes
            if (packets.length < 8 && Math.random() < 0.003) {
              packets.push(new DataPacket(nodeA, nodeB));
            }
          }
        }
      }

      // Update and draw data packets
      for (let k = packets.length - 1; k >= 0; k--) {
        const packet = packets[k];
        packet.update();
        packet.draw();
        if (packet.progress >= 1) {
          packets.splice(k, 1);
        }
      }

      animationFrameId = requestAnimationFrame(renderNetwork);
    }

    // Debounced window resize handler
    let resizeTimer = null;
    function handleResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        const newW = window.innerWidth;
        const newH = window.innerHeight;
        nodeCount = Math.max(16, Math.min(32, Math.floor(newW / 45)));
        width = canvas.width = newW;
        height = canvas.height = newH;
        updateCanvasRect();
        initNetwork();
      }, 150);
    }

    let canvasRect = null;
    updateCanvasRect = function () {
      if (canvas && isCanvasVisible) {
        canvasRect = canvas.getBoundingClientRect();
      }
    };
    if (canvas) {
      canvasRect = canvas.getBoundingClientRect();
    }

    window.addEventListener('resize', handleResize, { passive: true });

    window.addEventListener('mousemove', function (e) {
      if (!canvasRect) return;
      mouse.x = e.clientX - canvasRect.left;
      mouse.y = e.clientY - canvasRect.top;
    }, { passive: true });

    window.addEventListener('mouseleave', function () {
      mouse.x = -1000;
      mouse.y = -1000;
    });

    // Pause canvas when out of viewport
    if ('IntersectionObserver' in window) {
      const heroSection = document.getElementById('hero');
      if (heroSection) {
        const observer = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              isCanvasVisible = entry.isIntersecting;
              if (isCanvasVisible) {
                if (!animationFrameId) {
                  animationFrameId = requestAnimationFrame(renderNetwork);
                }
              } else if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
              }
            });
          },
          { threshold: 0.05 }
        );
        observer.observe(heroSection);
      }
    }

    initNetwork();
    animationFrameId = requestAnimationFrame(renderNetwork);
  }

  // -------------------------------------------------------------------------
  // 5. Active Section Highlighting via IntersectionObserver
  // -------------------------------------------------------------------------
  const sections = document.querySelectorAll('section[id]');
  if ('IntersectionObserver' in window && sections.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const currentId = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            const href = link.getAttribute('href');
            if (href === '#' + currentId) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  // -------------------------------------------------------------------------
  // 6. Expandable Technical Case Studies (Accordion / Disclosures)
  // -------------------------------------------------------------------------
  const caseStudyButtons = document.querySelectorAll('.case-study-toggle-btn');
  caseStudyButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const targetId = btn.getAttribute('aria-controls');
      const drawer = document.getElementById(targetId);
      if (!drawer) return;

      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!isExpanded));

      const labelSpan = btn.querySelector('.case-study-label');
      if (isExpanded) {
        drawer.classList.remove('is-open');
        drawer.setAttribute('hidden', '');
        if (labelSpan) labelSpan.textContent = 'View Technical Case Study';
      } else {
        drawer.classList.add('is-open');
        drawer.removeAttribute('hidden');
        if (labelSpan) labelSpan.textContent = 'Hide Technical Case Study';
      }
    });
  });

  // -------------------------------------------------------------------------
  // 7. Copy Email with Toast Feedback
  // -------------------------------------------------------------------------
  const copyEmailBtn = document.getElementById('copy-email-btn');
  const toast = document.getElementById('toast');
  let toastTimeout = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('toast-show');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(function () {
      toast.classList.remove('toast-show');
    }, 2800);
  }

  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', function () {
      const email = copyEmailBtn.getAttribute('data-email') || 'kharsh.wrk@gmail.com';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(
          function () {
            showToast('Email copied to clipboard: ' + email);
          },
          function () {
            fallbackCopyText(email);
          }
        );
      } else {
        fallbackCopyText(email);
      }
    });
  }

  function fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast('Email copied to clipboard: ' + text);
    } catch (err) {
      showToast('Please copy: ' + text);
    }
    document.body.removeChild(textArea);
  }

  // -------------------------------------------------------------------------
  // 8. Back to Top Smooth Scroll Button
  // -------------------------------------------------------------------------
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // -------------------------------------------------------------------------
  // 9. Consolidated Scroll Handler (Scroll Progress & Canvas Bounds)
  // -------------------------------------------------------------------------
  const scrollProgressEl = document.getElementById('scroll-progress');
  let isScrollTicking = false;
  window.addEventListener('scroll', function () {
    if (!isScrollTicking) {
      window.requestAnimationFrame(function () {
        // Update scroll-progress indicator
        if (scrollProgressEl) {
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const scrolled = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
          scrollProgressEl.style.width = Math.min(100, Math.max(0, scrolled)) + '%';
        }
        // Update canvas bounding box if hero canvas is active and visible
        if (typeof updateCanvasRect === 'function') {
          updateCanvasRect();
        }
        isScrollTicking = false;
      });
      isScrollTicking = true;
    }
  }, { passive: true });

  // -------------------------------------------------------------------------
  // 10. Progressive Section & Card Reveal (Respects prefers-reduced-motion)
  // -------------------------------------------------------------------------
  if (!isReducedMotion && 'IntersectionObserver' in window) {
    const revealTargets = document.querySelectorAll(
      '.section-title, .pillar-card, .skill-group-card, .exp-card, .project-card, .ai-ml-column, .achievement-card, .education-card, .contact-channels-card'
    );

    if (revealTargets.length > 0) {
      const revealObserver = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealed');
              observer.unobserve(entry.target); // Unobserve immediately to save resources
            }
          });
        },
        {
          rootMargin: '0px 0px -40px 0px',
          threshold: 0.1
        }
      );

      revealTargets.forEach(function (target) {
        target.classList.add('js-reveal');
        revealObserver.observe(target);
      });
    }
  }
})();
