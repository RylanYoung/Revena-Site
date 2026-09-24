/* Revena Media — Solar Pay-Per-Lead
   Shared behaviour: sticky nav, live lead feed, contact quiz. */

(function () {
  'use strict';

  /* ---------------- sticky nav shadow ---------------- */
  var navEl = document.getElementById('nav');
  if (navEl) {
    addEventListener('scroll', function () {
      navEl.classList.toggle('scrolled', scrollY > 20);
    }, { passive: true });
  }

  /* ---------------- services dropdown ---------------- */
  var drops = Array.prototype.slice.call(document.querySelectorAll('.drop'));
  if (drops.length) {
    drops.forEach(function (d) {
      var btn = d.querySelector('.drop-btn');
      if (!btn) return;
      var set = function (open) {
        d.setAttribute('data-open', open ? 'true' : 'false');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      };
      /* Hover belongs to the desktop bar only. On the mobile panel these
         same elements are accordion rows, and a stray mouseenter from a
         tap would open a row the moment it was closed. */
      var isDesktop = function () { return window.innerWidth > 960; };
      d.addEventListener('mouseenter', function () { if (isDesktop()) set(true); });
      d.addEventListener('mouseleave', function () { if (isDesktop()) set(false); });
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        set(d.getAttribute('data-open') !== 'true');
      });
      d.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { set(false); btn.focus(); }
      });
    });
    document.addEventListener('click', function (e) {
      /* inside the open mobile panel, tapping one row should not slam the
         others shut mid-scroll, so this only polices the desktop bar */
      if (window.innerWidth <= 960) return;
      drops.forEach(function (d) {
        if (!d.contains(e.target)) {
          d.setAttribute('data-open', 'false');
          var b = d.querySelector('.drop-btn');
          if (b) b.setAttribute('aria-expanded', 'false');
        }
      });
    });

    /* mark the current page inside the menu */
    var here = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.drop-menu a').forEach(function (a) {
      if (a.getAttribute('href') === here) a.setAttribute('aria-current', 'page');
    });
  }

  /* ---------------- mobile menu ----------------
     The panel is CSS-driven off nav.open, so the desktop dropdown
     code above needs no branching. Scroll is locked while it is
     open, otherwise the page slides around under the panel. */
  var navToggle = document.getElementById('nav-toggle');
  if (navToggle && navEl) {
    var setMenu = function (open) {
      navEl.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.classList.toggle('nav-locked', open);
      /* every group starts collapsed, so the menu always opens the same way */
      if (!open) {
        navEl.querySelectorAll('.drop').forEach(function (d) {
          d.setAttribute('data-open', 'false');
          var b = d.querySelector('.drop-btn');
          if (b) b.setAttribute('aria-expanded', 'false');
        });
      }
    };

    navToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      setMenu(!navEl.classList.contains('open'));
    });

    /* a tap on any destination should close it, including the CTA */
    navEl.querySelectorAll('.links a, .links .drop-menu a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });

    document.addEventListener('click', function (e) {
      if (navEl.classList.contains('open') && !navEl.contains(e.target)) setMenu(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navEl.classList.contains('open')) {
        setMenu(false);
        navToggle.focus();
      }
    });

    /* rotating a phone to landscape can cross the breakpoint with the
       panel still open, which would leave the body scroll locked */
    window.addEventListener('resize', function () {
      if (window.innerWidth > 960 && navEl.classList.contains('open')) setMenu(false);
    });
  }

  /* ---------------- live lead feed ---------------- */
  var feed = document.getElementById('feed');
  if (feed) {
    var mode = feed.getAttribute('data-feed') || 'mixed';

    var residential = [
      { biz: 'Kellyville, NSW 2155', owner: 'Yes', bill: '$480 / quarter', roof: 'Tile, single storey', want: 'Solar + battery', when: 'Immediately', why: 'Bills have jumped', name: 'Daniel M.', phone: '0412 ••• 884', email: 'daniel.m@••••••.com', t: '9:41 AM' },
      { biz: 'Berwick, VIC 3806', owner: 'Yes', bill: '$610 / quarter', roof: 'Colorbond, single storey', want: 'Solar + battery + EV', when: 'Within 1 month', why: 'Wants backup power', name: 'Priya S.', phone: '0433 ••• 217', email: 'priya.s@••••••.com', t: '10:06 AM' },
      { biz: 'Carindale, QLD 4152', owner: 'Yes', bill: '$530 / quarter', roof: 'Tile, double storey', want: 'Solar only', when: 'Immediately', why: 'Wants off peak-rate pricing', name: 'Tom B.', phone: '0401 ••• 559', email: 'tom.b@••••••.com', t: '10:52 AM' },
      { biz: 'Joondalup, WA 6027', owner: 'Yes', bill: '$450 / quarter', roof: 'Tile, single storey', want: 'Solar + battery', when: 'Within 1 month', why: 'Comparing three quotes', name: 'Lisa K.', phone: '0427 ••• 302', email: 'lisa.k@••••••.com', t: '11:38 AM' },
      { biz: 'Glenelg, SA 5045', owner: 'Yes', bill: '$520 / quarter', roof: 'Colorbond, single storey', want: 'Battery retrofit', when: 'Immediately', why: 'Has solar, adding storage', name: 'James W.', phone: '0450 ••• 771', email: 'james.w@••••••.com', t: '1:15 PM' },
      { biz: 'Newcastle, NSW 2300', owner: 'Yes', bill: '$575 / quarter', roof: 'Tile, single storey', want: 'Solar + battery', when: 'Within 1 month', why: 'Bills have jumped', name: 'Amelia R.', phone: '0418 ••• 640', email: 'amelia.r@••••••.com', t: '2:03 PM' }
    ];

    var commercial = [
      { biz: 'Harbourline Cold Storage', owner: 'Yes', bill: '$8,400 / month', roof: 'Warehouse, 1,800m²', want: 'Solar + storage', when: 'Immediately', why: 'Peak demand charges', name: 'Daniel M.', phone: '0412 ••• 884', email: 'daniel@••••••.com.au', t: '9:41 AM' },
      { biz: 'Westgate Manufacturing', owner: 'Yes', bill: '$14,200 / month', roof: 'Colorbond, 3,200m²', want: 'Solar + storage', when: 'Within 1–3 months', why: 'Board approved capex', name: 'Priya S.', phone: '0433 ••• 217', email: 'priya@••••••.com.au', t: '10:06 AM' },
      { biz: 'Ridgeline Poultry Farm', owner: 'Yes', bill: '$6,900 / month', roof: 'Shed, 2,400m²', want: 'Solar only', when: 'Immediately', why: 'Grid costs rising', name: 'Tom B.', phone: '0401 ••• 559', email: 'tom@••••••.com.au', t: '10:52 AM' },
      { biz: 'Northshore Medical Centre', owner: 'Leased — landlord onboard', bill: '$4,100 / month', roof: 'Flat membrane, 900m²', want: 'Solar + backup', when: 'Within 1–3 months', why: 'Outage risk on cold chain', name: 'Lisa K.', phone: '0427 ••• 302', email: 'lisa@••••••.com.au', t: '11:38 AM' },
      { biz: 'Summit Logistics Depot', owner: 'Yes', bill: '$11,500 / month', roof: 'Warehouse, 4,000m²', want: 'Solar + storage', when: 'Immediately', why: 'Refrigeration load', name: 'James W.', phone: '0450 ••• 771', email: 'james@••••••.com.au', t: '1:15 PM' },
      { biz: 'Bayside Hotel Group', owner: 'Yes', bill: '$9,300 / month', roof: 'Tile + flat, 1,500m²', want: 'Battery retrofit', when: 'Within 1–3 months', why: 'Has solar, adding storage', name: 'Amelia R.', phone: '0418 ••• 640', email: 'amelia@••••••.com.au', t: '2:03 PM' }
    ];

    /* done-for-you: we've already called and booked the appointment */
    var booked = [
      { biz: 'Kellyville, NSW 2155', owner: 'Yes', bill: '$480 / quarter', roof: 'Tile, single storey', want: 'Solar + battery', when: 'Thu 2:30pm', why: 'Confirmed by SMS', name: 'Daniel M.', phone: '0412 ••• 884', email: 'Booked by Revena · Sarah', t: '9:41 AM' },
      { biz: 'Harbourline Cold Storage', owner: 'Yes', bill: '$8,400 / month', roof: 'Warehouse, 1,800m²', want: 'Solar + storage', when: 'Fri 10:00am', why: 'Site visit agreed', name: 'Priya S.', phone: '0433 ••• 217', email: 'Booked by Revena · Jordan', t: '10:06 AM' },
      { biz: 'Carindale, QLD 4152', owner: 'Yes', bill: '$530 / quarter', roof: 'Tile, double storey', want: 'Solar + battery', when: 'Thu 5:15pm', why: 'Confirmed by SMS', name: 'Tom B.', phone: '0401 ••• 559', email: 'Booked by Revena · Sarah', t: '10:52 AM' },
      { biz: 'Joondalup, WA 6027', owner: 'Yes', bill: '$450 / quarter', roof: 'Tile, single storey', want: 'Battery retrofit', when: 'Mon 11:00am', why: 'Confirmed by SMS', name: 'Lisa K.', phone: '0427 ••• 302', email: 'Booked by Revena · Jordan', t: '11:38 AM' },
      { biz: 'Summit Logistics Depot', owner: 'Yes', bill: '$11,500 / month', roof: 'Warehouse, 4,000m²', want: 'Solar + storage', when: 'Tue 9:00am', why: 'Site visit agreed', name: 'James W.', phone: '0450 ••• 771', email: 'Booked by Revena · Sarah', t: '1:15 PM' },
      { biz: 'Newcastle, NSW 2300', owner: 'Yes', bill: '$575 / quarter', roof: 'Tile, single storey', want: 'Solar + battery', when: 'Wed 4:00pm', why: 'Confirmed by SMS', name: 'Amelia R.', phone: '0418 ••• 640', email: 'Booked by Revena · Jordan', t: '2:03 PM' }
    ];

    var labels = {
      residential: { a: 'Homeowner', b: 'Power bill', c: 'Roof', d: 'Wants', e: 'Timeline', f: 'Trigger', head: 'New lead' },
      commercial: { a: 'Decision-maker', b: 'Power bill', c: 'Roof / site', d: 'Wants', e: 'Timeline', f: 'Trigger', head: 'New lead' },
      mixed: { a: 'Owner / decision-maker', b: 'Power bill', c: 'Roof / site', d: 'Wants', e: 'Timeline', f: 'Trigger', head: 'New lead' },
      dfy: { a: 'Qualified', b: 'Power bill', c: 'Roof / site', d: 'Wants', e: 'Appointment', f: 'Status', head: 'Appointment booked' }
    };

    var leads, lab;
    if (mode === 'commercial') {
      leads = commercial; lab = labels.commercial;
    } else if (mode === 'residential') {
      leads = residential; lab = labels.residential;
    } else if (mode === 'dfy') {
      leads = booked; lab = labels.dfy;
    } else {
      leads = [residential[0], commercial[0], residential[2], commercial[1], residential[4], commercial[3]];
      lab = labels.mixed;
    }

    var esc = function (s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    };

    var bubble = function (l, fresh) {
      var d = document.createElement('div');
      d.className = 'bubble' + (fresh ? ' new' : '');
      d.innerHTML =
        '<b>' + lab.head + ' · ' + esc(l.biz) + '</b>' +
        '<div class="row"><span>' + lab.a + '</span><span>' + esc(l.owner) + '</span></div>' +
        '<div class="row"><span>' + lab.b + '</span><span>' + esc(l.bill) + '</span></div>' +
        '<div class="row"><span>' + lab.c + '</span><span>' + esc(l.roof) + '</span></div>' +
        '<div class="row"><span>' + lab.d + '</span><span>' + esc(l.want) + '</span></div>' +
        '<div class="row"><span>' + lab.e + '</span><span>' + esc(l.when) + '</span></div>' +
        '<div class="row"><span>' + lab.f + '</span><span>' + esc(l.why) + '</span></div>' +
        '<div class="contact">' + esc(l.name) + ' · ' + esc(l.phone) +
        '<small>' + esc(l.email) + ' · ' + esc(l.t) + '</small></div>';
      return d;
    };

    leads.slice(0, 3).forEach(function (l) { feed.appendChild(bubble(l, false)); });

    var i = 3;
    setInterval(function () {
      feed.appendChild(bubble(leads[i % leads.length], true));
      i++;
      feed.scrollTo({ top: feed.scrollHeight, behavior: 'smooth' });
      if (feed.children.length > 9) feed.children[1].remove();
    }, 4500);
  }

  /* ---------------- contact quiz ----------------
     Submissions POST to a GoHighLevel inbound webhook, which fires the
     workflow that creates the contact. */
  var QUIZ_HOOK = 'https://services.leadconnectorhq.com/hooks/DRFPtkVmheRZDyJlALs4/webhook-trigger/f54490f6-fb0f-4c4a-9811-906fddefa896';
  var quiz = document.getElementById('quiz');
  if (quiz) {
    var steps = Array.prototype.slice.call(quiz.querySelectorAll('.quiz-step'));
    var bar = quiz.querySelector('.quiz-bar i');
    var answers = {};
    var at = 0;

    var show = function (n, silent) {
      at = Math.max(0, Math.min(n, steps.length - 1));
      steps.forEach(function (s, idx) { s.classList.toggle('on', idx === at); });
      /* step 1 already shows progress rather than an empty track */
      if (bar) bar.style.width = ((at + 1) / steps.length * 100) + '%';
      if (silent) return;
      var h = steps[at].querySelector('.quiz-q');
      if (h) {
        h.setAttribute('tabindex', '-1');
        h.focus({ preventScroll: true });
      }
      quiz.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    };

    var sync = function (step, value) {
      answers[step.dataset.key] = value;
      var hidden = quiz.querySelector('input[name="' + step.dataset.key + '"]');
      if (hidden) hidden.value = value;
    };

    quiz.addEventListener('click', function (e) {
      var opt = e.target.closest('.opt');
      if (opt) {
        var step = opt.closest('.quiz-step');

        /* multi-select: toggle, don't advance */
        if (step.hasAttribute('data-multi')) {
          var isOn = opt.getAttribute('aria-pressed') === 'true';
          opt.setAttribute('aria-pressed', isOn ? 'false' : 'true');
          var picked = [];
          step.querySelectorAll('.opt[aria-pressed="true"]').forEach(function (o) {
            picked.push(o.dataset.value || o.textContent.trim());
          });
          sync(step, picked.join(', '));
          var next = step.querySelector('.quiz-next');
          if (next) next.disabled = picked.length === 0;
          return;
        }

        /* single select: advance */
        step.querySelectorAll('.opt').forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
        opt.setAttribute('aria-pressed', 'true');
        sync(step, opt.dataset.value || opt.textContent.trim());
        setTimeout(function () { show(at + 1); }, 180);
        return;
      }
      if (e.target.closest('.quiz-next')) {
        e.preventDefault();
        show(at + 1);
        return;
      }
      if (e.target.closest('.quiz-back')) {
        e.preventDefault();
        show(at - 1);
      }
    });

    var form = quiz.querySelector('form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = form.querySelector('#q-name');
        var company = form.querySelector('#q-company');
        var email = form.querySelector('#q-email');
        var phone = form.querySelector('#q-phone');

        var required = [name, company, email, phone].filter(Boolean);
        var missing = null;
        for (var r = 0; r < required.length; r++) {
          if (!required[r].value.trim()) { missing = required[r]; break; }
        }
        if (missing) { missing.focus(); return; }

        var notes = form.querySelector('#q-notes');
        var full = name.value.trim();
        var sp = full.indexOf(' ');

        var payload = {
          first_name: sp > 0 ? full.slice(0, sp) : full,
          last_name: sp > 0 ? full.slice(sp + 1).trim() : '',
          full_name: full,
          company: company ? company.value.trim() : '',
          email: email.value.trim(),
          phone: phone.value.trim(),
          notes: notes ? notes.value.trim() : '',
          business_type: answers['Business type'] || '',
          interested_in: answers['Interested in'] || '',
          source: 'revenamedia.com solar site',
          page: location.pathname || '/contact',
          submitted_at: new Date().toISOString()
        };

        var btn = form.querySelector('button[type="submit"]');
        var label = btn ? btn.textContent : '';
        if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }

        var finish = function (ok) {
          if (btn) { btn.disabled = false; btn.textContent = label; }
          if (!ok) {
            var t = document.getElementById('q-done-title');
            var s = document.getElementById('q-done-sub');
            if (t) t.textContent = 'That did not send.';
            if (s) {
              s.innerHTML = 'Something blocked the connection. Email us at '
                + '<a href="mailto:rylan@revenamedia.com" style="color:var(--blue);font-weight:600">rylan@revenamedia.com</a>'
                + ' or call 0479 116 472 and we will pick it up straight away.';
            }
          }
          show(steps.length - 1);
          if (bar) bar.style.width = '100%';
        };

        /* The hook answers the preflight with Access-Control-Allow-Origin *,
           so this can be a normal CORS request. That matters: the response is
           readable, and the hook returns 200 with an error status in the body
           when it rejects a payload, so the body is the only honest signal. */
        var body = JSON.stringify(payload);
        if (window.fetch) {
          fetch(QUIZ_HOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body
          }).then(function (res) {
            if (!res.ok) return finish(false);
            return res.text().then(function (txt) {
              finish(!/"status"\s*:\s*"Error/i.test(txt));
            });
          }).catch(function () { finish(false); });
        } else {
          var xhr = new XMLHttpRequest();
          xhr.open('POST', QUIZ_HOOK, true);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.onload = function () {
            finish(xhr.status >= 200 && xhr.status < 300
              && !/"status"\s*:\s*"Error/i.test(xhr.responseText));
          };
          xhr.onerror = function () { finish(false); };
          xhr.send(body);
        }
      });
    }

    show(0, true);
  }
})();

/* ============================================================
   MOTION ENGINE
   Tags elements for scroll-reveal automatically, so markup stays
   clean. Everything degrades: no JS means no .js class on <html>,
   which means no reveal styles and fully visible content.
   ============================================================ */
(function () {
  'use strict';

  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- scroll progress bar ---------------- */
  if (!reduced) {
    var prog = document.createElement('div');
    prog.className = 'scroll-prog';
    document.body.appendChild(prog);
    var tickProg = function () {
      var max = document.documentElement.scrollHeight - innerHeight;
      prog.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
    };
    addEventListener('scroll', tickProg, { passive: true });
    addEventListener('resize', tickProg, { passive: true });
    tickProg();
  }

  /* ---------------- count-up ---------------- */
  var countUp = function (el) {
    if (el.dataset.counted) return;
    var m = el.textContent.trim().match(/^([^\d]*)(\d[\d,]*)([^\d]*)$/);
    if (!m) return;
    el.dataset.counted = '1';
    var pre = m[1], raw = m[2], suf = m[3];
    var target = parseInt(raw.replace(/,/g, ''), 10);
    if (reduced || !target) return;
    var grouped = raw.indexOf(',') > -1;
    var dur = 1100, start = null, done = false;

    /* These are product claims ("100% Exclusive"), so the final value must
       never be left stranded mid-count if rAF is throttled or the tab is
       backgrounded. This guard always writes the true value. */
    var finalize = function () {
      if (done) return;
      done = true;
      el.textContent = pre + raw + suf;
    };
    var guard = setTimeout(finalize, dur + 400);

    var step = function (ts) {
      if (done) return;
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      if (p < 1) {
        var eased = 1 - Math.pow(1 - p, 4);
        var v = Math.round(target * eased);
        el.textContent = pre + (grouped ? v.toLocaleString('en-AU') : v) + suf;
        requestAnimationFrame(step);
      } else {
        clearTimeout(guard);
        finalize();
      }
    };
    requestAnimationFrame(step);
  };

  var COUNTERS = '.hero-proof strong, .stat b, td .x';

  /* ---------------- reveal tagging ---------------- */
  /* [selector, style, stagger-ms]  — first match wins per element */
  var CFG = [
    ['.hero .eyebrow', 'up-sm', 0],
    ['.hero h1', 'up', 0],
    ['.hero .lead', 'up', 0],
    ['.hero .hero-ctas', 'up', 0],
    ['.hero-proof > div', 'up-sm', 80],
    ['.stage', 'zoom', 0],
    ['section h2', 'up', 0],
    ['section .eyebrow', 'up-sm', 0],
    ['section > .wrap > .lead, section > .wrap-narrow > .lead, .split .lead', 'up', 0],
    ['.cols > div', 'up', 80],
    ['.check', 'up', 90],
    ['.step', 'up', 80],
    ['.loc', 'up', 70],
    ['.stat', 'up', 70],
    ['.pill', 'up-sm', 30],
    ['.compare', 'right', 0],
    ['tbody tr', 'up-sm', 60],
    ['.cta-strip', 'zoom', 0],
    ['.nopay', 'left', 0],
    ['.roi-note', 'fade', 0],
    ['.faq details', 'up-sm', 55],
    ['.prose > p, .prose > h3, .prose > ul', 'up-sm', 0],
    ['.quiz', 'zoom', 0],
    ['.ccard', 'up', 70],
    ['.speed .big', 'left', 0],
    ['.speed > div:last-child', 'right', 0],
    ['.foot-top > div', 'up-sm', 70],
    ['.cta .btn', 'up-sm', 60]
  ];

  CFG.forEach(function (rule) {
    var els = document.querySelectorAll(rule[0]);
    var seen = new Map();
    Array.prototype.forEach.call(els, function (el) {
      if (el.hasAttribute('data-reveal')) return;
      el.setAttribute('data-reveal', rule[1]);
      if (rule[2]) {
        var parent = el.parentElement;
        var n = seen.get(parent) || 0;
        seen.set(parent, n + 1);
        if (n) el.style.setProperty('--d', n * rule[2] + 'ms');
      }
    });
  });

  /* ---------------- reveal observer ---------------- */
  var targets = document.querySelectorAll('[data-reveal]');

  var revealNow = function (el) {
    el.classList.add('is-in');
    if (el.matches(COUNTERS)) countUp(el);
    Array.prototype.forEach.call(el.querySelectorAll(COUNTERS), countUp);
  };

  if (!('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(targets, revealNow);
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        revealNow(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -60px 0px' });
    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
  }

  /* ---------------- page transition fallback ----------------
     Only for browsers without cross-document View Transitions.
     Navigation always proceeds, so a failure here can't trap anyone. */
  /* startViewTransition alone isn't enough: it shipped for same-document
     transitions well before cross-document ones. CSSViewTransitionRule is
     what tells us @view-transition navigation is actually honoured. And
     cross-document transitions never fire on file://, so local previews
     use the fallback too. */
  var hasVT = typeof document.startViewTransition === 'function'
    && ('CSSViewTransitionRule' in window)
    && location.protocol !== 'file:';

  if (!hasVT && !reduced) {
    var veil = document.createElement('div');
    veil.className = 'page-veil';

    var clearVeil = function () {
      veil.classList.remove('on');
      if (veil.parentNode) veil.parentNode.removeChild(veil);
    };
    addEventListener('pageshow', clearVeil);

    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      var a = e.target.closest('a');
      if (!a) return;

      var href = a.getAttribute('href');
      if (!href) return;
      if (a.target && a.target !== '_self') return;
      if (a.hasAttribute('download')) return;
      if (/^(mailto:|tel:|#)/.test(href)) return;

      var url;
      try { url = new URL(href, location.href); } catch (err) { return; }
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.hash) return;

      e.preventDefault();
      document.body.appendChild(veil);
      requestAnimationFrame(function () { veil.classList.add('on'); });
      setTimeout(function () { location.href = url.href; }, 190);
    });
  }

  /* ---------------- animated FAQ accordion ---------------- */
  if (!reduced) {
    Array.prototype.forEach.call(document.querySelectorAll('.faq details'), function (d) {
      var summary = d.querySelector('summary');
      var ans = d.querySelector('.ans');
      if (!summary || !ans) return;

      var PAD = 24;               /* matches .faq .ans padding-bottom */
      var busy = false;
      var timer = null;

      var settle = function () {
        ans.style.height = '';
        ans.style.opacity = '';
        ans.style.paddingBottom = '';
        clearTimeout(timer);
        busy = false;
      };

      summary.addEventListener('click', function (e) {
        e.preventDefault();
        if (busy) return;
        busy = true;

        var closing = d.open;
        if (!closing) d.open = true;

        /* border-box is global, so scrollHeight already includes padding */
        var full = ans.scrollHeight;

        ans.style.height = (closing ? full : 0) + 'px';
        ans.style.paddingBottom = (closing ? PAD : 0) + 'px';
        ans.style.opacity = closing ? '1' : '0';

        void ans.offsetHeight;   /* force reflow so the transition runs */

        ans.style.height = (closing ? 0 : full) + 'px';
        ans.style.paddingBottom = (closing ? 0 : PAD) + 'px';
        ans.style.opacity = closing ? '0' : '1';

        var finish = function (ev) {
          if (ev && ev.propertyName !== 'height') return;
          ans.removeEventListener('transitionend', finish);
          if (closing) d.open = false;
          settle();
        };

        ans.addEventListener('transitionend', finish);
        timer = setTimeout(finish, 480);   /* safety net */
      });
    });
  }
})();
