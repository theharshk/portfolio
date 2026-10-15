const http = require('http');
const { spawn } = require('child_process');

// Run tests using Chrome DevTools Protocol directly over WebSocket
async function runTests() {
  console.log('Starting automated headless browser verification...');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--no-sandbox',
    '--disable-gpu',
    'http://localhost:8080'
  ]);

  // Give Chrome a moment to open debugging port
  await new Promise(r => setTimeout(r, 2000));

  try {
    // 1. Get WebSocket debugger URL
    const targetsRes = await fetch('http://127.0.0.1:9222/json');
    const targets = await targetsRes.json();
    const pageTarget = targets.find(t => t.type === 'page');

    if (!pageTarget) {
      throw new Error('No page target found');
    }

    console.log('Attached to target:', pageTarget.url);
    const wsUrl = pageTarget.webSocketDebuggerUrl;

    const WebSocket = globalThis.WebSocket;
    const ws = new WebSocket(wsUrl);

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    const pending = new Map();
    const consoleLogs = [];
    const jsErrors = [];

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        consoleLogs.push(msg.params.args.map(a => a.value || a.description).join(' '));
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        jsErrors.push(msg.params.exceptionDetails.text);
      }
      if (msg.id && pending.has(msg.id)) {
        const { resolve } = pending.get(msg.id);
        pending.delete(msg.id);
        resolve(msg);
      }
    };

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const id = msgId++;
        pending.set(id, { resolve });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send('Runtime.enable');
    await send('Page.enable');

    async function evaluate(expression) {
      const res = await send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true
      });
      if (res.result && res.result.exceptionDetails) {
        throw new Error(res.result.exceptionDetails.text);
      }
      return res.result.result.value;
    }

    async function setViewport(width, height) {
      await send('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: width <= 768
      });
      // Small pause for layout calculation
      await new Promise(r => setTimeout(r, 300));
    }

    const results = [];

    // TEST 1: Console errors
    console.log('\n--- Checking for Console Errors ---');
    results.push({
      test: 'No JavaScript runtime errors or uncaught exceptions',
      passed: jsErrors.length === 0,
      detail: jsErrors.length ? jsErrors.join('; ') : '0 errors logged'
    });

    // TEST 2: Responsive Viewport - 360px
    console.log('\n--- Testing 360px Viewport (Mobile) ---');
    await setViewport(360, 640);
    const scrollWidth360 = await evaluate('document.documentElement.scrollWidth');
    results.push({
      test: '360px: No horizontal overflow (scrollWidth <= 360)',
      passed: scrollWidth360 <= 360,
      detail: `scrollWidth = ${scrollWidth360}px (innerWidth = 360px)`
    });

    // Mobile nav toggle test
    const mobileNavOpened = await evaluate(`(() => {
      const btn = document.getElementById('nav-toggle');
      btn.click();
      const menu = document.getElementById('nav-menu');
      return btn.getAttribute('aria-expanded') === 'true' && menu.classList.contains('is-open');
    })()`);
    results.push({
      test: '360px: Mobile hamburger menu opens on click',
      passed: mobileNavOpened === true,
      detail: `aria-expanded=true & is-open class present: ${mobileNavOpened}`
    });

    const mobileNavClosed = await evaluate(`(() => {
      const link = document.querySelector('#nav-menu .nav-link');
      link.click();
      const menu = document.getElementById('nav-menu');
      const btn = document.getElementById('nav-toggle');
      return !menu.classList.contains('is-open') && btn.getAttribute('aria-expanded') === 'false';
    })()`);
    results.push({
      test: '360px: Mobile navigation closes on link click',
      passed: mobileNavClosed === true,
      detail: `is-open removed & aria-expanded=false: ${mobileNavClosed}`
    });

    // TEST 3: Responsive Viewport - 768px (Tablet)
    console.log('\n--- Testing 768px Viewport (Tablet) ---');
    await setViewport(768, 1024);
    const scrollWidth768 = await evaluate('document.documentElement.scrollWidth');
    results.push({
      test: '768px: No horizontal overflow (scrollWidth <= 768)',
      passed: scrollWidth768 <= 768,
      detail: `scrollWidth = ${scrollWidth768}px (innerWidth = 768px)`
    });

    // TEST 4: Responsive Viewport - 1280px (Desktop)
    console.log('\n--- Testing 1280px Viewport (Desktop) ---');
    await setViewport(1280, 800);
    const scrollWidth1280 = await evaluate('document.documentElement.scrollWidth');
    results.push({
      test: '1280px: No horizontal overflow (scrollWidth <= 1280)',
      passed: scrollWidth1280 <= 1280,
      detail: `scrollWidth = ${scrollWidth1280}px (innerWidth = 1280px)`
    });

    // TEST 5: Theme Toggle Functionality
    console.log('\n--- Testing Theme Toggle ---');
    const themeTest = await evaluate(`(() => {
      const btn = document.getElementById('theme-toggle');
      const root = document.documentElement;
      const initial = root.getAttribute('data-theme') || 'dark';
      btn.click();
      const afterClick1 = root.getAttribute('data-theme') || 'dark';
      const stored = localStorage.getItem('kh_portfolio_theme');
      btn.click();
      const afterClick2 = root.getAttribute('data-theme') || 'dark';
      return { initial, afterClick1, stored, afterClick2 };
    })()`);
    results.push({
      test: 'Theme toggle switches to light and back to dark, persisting in localStorage',
      passed: themeTest.afterClick1 === 'light' && themeTest.stored === 'light' && themeTest.afterClick2 === 'dark',
      detail: `Dark -> ${themeTest.afterClick1} (stored: ${themeTest.stored}) -> ${themeTest.afterClick2}`
    });

    // TEST 6: Project Case Studies Toggle
    console.log('\n--- Testing Expandable Project Case Studies ---');
    const caseStudies = await evaluate(`(() => {
      const btn1 = document.querySelector('button[aria-controls="case-study-hypnotiser"]');
      const drawer1 = document.getElementById('case-study-hypnotiser');
      btn1.click();
      const open1 = drawer1.classList.contains('is-open') && !drawer1.hasAttribute('hidden') && btn1.getAttribute('aria-expanded') === 'true';
      btn1.click();
      const closed1 = !drawer1.classList.contains('is-open') && drawer1.hasAttribute('hidden') && btn1.getAttribute('aria-expanded') === 'false';

      const btn2 = document.querySelector('button[aria-controls="case-study-hcp-crm"]');
      const drawer2 = document.getElementById('case-study-hcp-crm');
      btn2.click();
      const open2 = drawer2.classList.contains('is-open') && !drawer2.hasAttribute('hidden');

      const btn3 = document.querySelector('button[aria-controls="case-study-rental"]');
      const drawer3 = document.getElementById('case-study-rental');
      btn3.click();
      const open3 = drawer3.classList.contains('is-open') && !drawer3.hasAttribute('hidden');

      return { open1, closed1, open2, open3 };
    })()`);
    results.push({
      test: 'All project case study drawers expand and collapse smoothly with correct ARIA attributes',
      passed: caseStudies.open1 && caseStudies.closed1 && caseStudies.open2 && caseStudies.open3,
      detail: `Hypnotiser: open=${caseStudies.open1}, close=${caseStudies.closed1} | HCP CRM: open=${caseStudies.open2} | Rental: open=${caseStudies.open3}`
    });

    // TEST 7: Contact Links & Privacy
    console.log('\n--- Testing Contact Section & Data Privacy ---');
    await send('Browser.grantPermissions', {
      permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite']
    }).catch(() => {});

    const contactCheck = await evaluate(`(async () => {
      const mailto = document.querySelector('a[href^="mailto:"]');
      const tel = document.querySelector('a[href^="tel:"]');
      const phoneNum = '6202447542';
      
      // Phone number must ONLY appear in the contact section
      const contactSec = document.getElementById('contact').innerText;
      const nonContactText = document.body.innerHTML.replace(document.getElementById('contact').innerHTML, '');
      const phoneLeakedOutside = nonContactText.includes(phoneNum);

      // Copy email button
      const copyBtn = document.getElementById('copy-email-btn');
      copyBtn.click();
      await new Promise(r => setTimeout(r, 300));
      const toast = document.getElementById('toast');
      const toastShown = toast.classList.contains('toast-show') && toast.innerText.includes('kharsh.wrk@gmail.com');

      return {
        mailto: mailto ? mailto.getAttribute('href') : null,
        tel: tel ? tel.getAttribute('href') : null,
        phoneLeakedOutside,
        toastShown
      };
    })()`);
    results.push({
      test: 'Contact section contains working mailto, tel links and copy email toast',
      passed: contactCheck.mailto === 'mailto:kharsh.wrk@gmail.com' && contactCheck.tel === 'tel:+916202447542' && contactCheck.toastShown,
      detail: `Mail: ${contactCheck.mailto}, Tel: ${contactCheck.tel}, Toast active: ${contactCheck.toastShown}`
    });
    results.push({
      test: 'Phone number is displayed ONLY in the Contact section (never in hero or other sections)',
      passed: !contactCheck.phoneLeakedOutside,
      detail: contactCheck.phoneLeakedOutside ? 'FAIL: Phone found outside contact' : 'PASS: Isolated strictly to Contact'
    });

    // TEST 8: Navigation Anchor Verification
    console.log('\n--- Verifying All Navigation Links Target Real Sections ---');
    const navAnchors = await evaluate(`(() => {
      const links = Array.from(document.querySelectorAll('#nav-menu .nav-link'));
      const missing = [];
      for (const link of links) {
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
          const target = document.querySelector(href);
          if (!target) missing.push(href);
        }
      }
      return { total: links.length, missing };
    })()`);
    results.push({
      test: 'All navigation links resolve to valid on-page section elements',
      passed: navAnchors.missing.length === 0,
      detail: `${navAnchors.total} links verified. Missing: [${navAnchors.missing.join(', ')}]`
    });

    // TEST 9: Reduced Motion Support
    console.log('\n--- Testing Reduced Motion Mode ---');
    await send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
    });
    const reducedMotionCheck = await evaluate(`(() => {
      const canvas = document.getElementById('hero-canvas');
      const style = window.getComputedStyle(canvas);
      return style.display === 'none';
    })()`);
    results.push({
      test: 'prefers-reduced-motion: reduce disables hero canvas animations',
      passed: reducedMotionCheck === true,
      detail: `hero-canvas display: ${reducedMotionCheck ? 'none (PASS)' : 'visible (FAIL)'}`
    });

    // Print Final Results
    console.log('\n======================================================');
    console.log('              AUTOMATED TEST RESULTS                  ');
    console.log('======================================================');
    let allPassed = true;
    for (const r of results) {
      const status = r.passed ? 'PASS [✓]' : 'FAIL [✗]';
      console.log(`${status} ${r.test}`);
      console.log(`       Detail: ${r.detail}`);
      if (!r.passed) allPassed = false;
    }
    console.log('======================================================');
    console.log(allPassed ? 'ALL TESTS PASSED WITH 100% SUCCESS!' : 'SOME TESTS FAILED.');

    ws.close();
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    chromeProc.kill();
  }
}

runTests();
