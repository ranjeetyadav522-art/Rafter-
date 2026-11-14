/* Rafter Technologies
   Mobile navigation and accessible form validation.
   No dependencies. */

(function () {
  'use strict';

  /* ----- Mobile navigation ----- */

  var toggle = document.querySelector('.navtoggle');
  var nav = document.getElementById('sitenav');

  if (toggle && nav) {
    var mq = window.matchMedia('(max-width: 820px)');

    function applyState() {
      if (mq.matches) {
        nav.hidden = toggle.getAttribute('aria-expanded') !== 'true';
      } else {
        nav.hidden = false;
        toggle.setAttribute('aria-expanded', 'false');
      }
    }

    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.querySelector('.visually_hidden').textContent = open ? 'Open menu' : 'Close menu';
      applyState();
    });

    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A' && mq.matches) {
        toggle.setAttribute('aria-expanded', 'false');
        applyState();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        toggle.setAttribute('aria-expanded', 'false');
        applyState();
        toggle.focus();
      }
    });

    if (mq.addEventListener) {
      mq.addEventListener('change', applyState);
    } else if (mq.addListener) {
      mq.addListener(applyState);
    }

    applyState();
  }

  /* ----- Form validation -----
     Errors appear beside the field they belong to. After a failed submit a
     summary is focused at the top of the form and each entry links to its
     field, which is what screen reader users need in order to recover. */

  var form = document.getElementById('enquiry');
  if (!form) { return; }

  var summary = document.getElementById('errorsummary');
  var list = document.getElementById('errorlist');
  var sent = document.getElementById('sent');

  var rules = [
    { id: 'name', label: 'Full name', test: function (v) { return v.trim().length >= 2; },
      message: 'Enter your full name so we know who we are replying to.' },
    { id: 'email', label: 'Email address', test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); },
      message: 'Enter a valid email address, for example name@example.com.' },
    { id: 'topic', label: 'What do you need', test: function (v) { return v !== ''; },
      message: 'Choose the option that fits you best.' },
    { id: 'message', label: 'Tell us a bit more', test: function (v) { return v.trim().length >= 12; },
      message: 'Add a little more detail so we can give you a useful reply.' }
  ];

  function setError(rule, message) {
    var input = document.getElementById(rule.id);
    var slot = document.getElementById(rule.id + 'error');
    if (message) {
      input.setAttribute('aria-invalid', 'true');
      slot.textContent = message;
    } else {
      input.removeAttribute('aria-invalid');
      slot.textContent = '';
    }
  }

  function validateOne(rule) {
    var input = document.getElementById(rule.id);
    var ok = rule.test(input.value);
    setError(rule, ok ? '' : rule.message);
    return ok;
  }

  /* Validate on blur, never on every keystroke. Re-check while typing only
     once a field has already been marked invalid, so the error clears as
     soon as it is fixed. */
  rules.forEach(function (rule) {
    var input = document.getElementById(rule.id);
    if (!input) { return; }
    input.addEventListener('blur', function () { validateOne(rule); });
    input.addEventListener('input', function () {
      if (input.getAttribute('aria-invalid') === 'true') { validateOne(rule); }
    });
    if (input.tagName === 'SELECT') {
      input.addEventListener('change', function () { validateOne(rule); });
    }
  });

  var button = form.querySelector('button[type=submit]');
  var inbox = form.getAttribute('data_inbox');
  var endpoint = form.getAttribute('data_endpoint');

  function announce(text, ok) {
    sent.textContent = text;
    sent.style.borderColor = ok ? '#0a0a0a' : '#b91c1c';
    sent.hidden = false;
    sent.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var failed = [];
    rules.forEach(function (rule) {
      if (!validateOne(rule)) { failed.push(rule); }
    });

    if (failed.length) {
      list.innerHTML = '';
      failed.forEach(function (rule) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = '#' + rule.id;
        a.textContent = rule.label + ': ' + rule.message;
        a.addEventListener('click', function (ev) {
          ev.preventDefault();
          document.getElementById(rule.id).focus();
        });
        li.appendChild(a);
        list.appendChild(li);
      });
      summary.hidden = false;
      summary.focus();
      return;
    }

    summary.hidden = true;

    if (!endpoint || !inbox) {
      announce('This form is not connected to an inbox yet, so nothing has been sent.', false);
      return;
    }

    /* Disable the button while the request is in flight so a slow connection
       cannot produce three copies of the same enquiry. */
    var original = button.textContent;
    button.disabled = true;
    button.textContent = 'Sending';
    sent.hidden = true;

    var payload = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      topic: document.getElementById('topic').value,
      field: document.getElementById('domain').value.trim(),
      message: document.getElementById('message').value.trim(),
      _subject: 'Website enquiry: ' + document.getElementById('topic').value,
      _template: 'table',
      _captcha: 'false'
    };

    fetch(endpoint + inbox, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) { return res.json().catch(function () { return {}; }); })
      .then(function (data) {
        if (data && String(data.success) === 'true') {
          form.reset();
          rules.forEach(function (rule) { setError(rule, ''); });
          announce('Thank you. Your message has been sent and we will get back to you at the address you gave us.', true);
        } else {
          announce('Something went wrong sending your message. Please email us directly at ' + inbox + ' and we will pick it up from there.', false);
        }
      })
      .catch(function () {
        announce('Your message could not be sent, which usually means a connection problem. Please email us directly at ' + inbox + ' and we will pick it up from there.', false);
      })
      .then(function () {
        button.disabled = false;
        button.textContent = original;
      });
  });

})();

/* Rafter Technologies
   Motion layer.

   settle   content rises into place the first time it is seen
   scrub    the hero, the statement, the service cards, the band and the
            process line track the scroll position directly
   pointer  a soft light follows the cursor on dark surfaces

   The gate below matters. Several resting states hide content, so the
   .js_anim class that switches them on is added only when JavaScript runs
   AND the visitor has not asked for reduced motion. Otherwise the site is
   plain static content with everything visible. */

(function () {
  'use strict';

  var root = document.documentElement;
  var masthead = document.querySelector('.masthead');

  function clamp(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }
  function shown(el) { return el.offsetParent !== null; }
  function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }

  /* The header hairline is not motion, so it runs for everyone. */
  function hairline() {
    if (masthead) { masthead.classList.toggle('stuck', window.scrollY > 8); }
  }

  var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  if (calm && calm.matches) {
    window.addEventListener('scroll', hairline, { passive: true });
    hairline();
    return;
  }

  root.classList.add('js_anim');

  /* ----- Settle: reveal once on first sight ----- */

  var observer = null;

  function showAll() {
    each('.reveal, .stagger', function (el) { el.classList.add('seen'); });
  }

  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        entry.target.classList.add('seen');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
  }

  function watch() {
    if (!observer) { showAll(); return; }
    each('.reveal:not(.seen), .stagger:not(.seen)', function (el) {
      if (el.classList.contains('stagger')) {
        Array.prototype.forEach.call(el.children, function (child, i) {
          child.style.transitionDelay = Math.min(i * 80, 400) + 'ms';
        });
      }
      observer.observe(el);
    });
  }

  /* ----- Scrub: prepare the pieces ----- */

  /* Split each statement into words once. The text and its spacing are left
     intact, so it still reads as one paragraph to assistive technology. */
  each('.statement[data_words]', function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach(function (word, i) {
      var span = document.createElement('span');
      span.className = 'w';
      span.textContent = word;
      el.appendChild(span);
      if (i < words.length - 1) { el.appendChild(document.createTextNode(' ')); }
    });
  });

  var bar = document.createElement('div');
  bar.className = 'progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  var stacking = window.matchMedia('(min-width: 900px) and (min-height: 700px)');

  function frame() {
    var vh = window.innerHeight;
    var y = window.scrollY;
    var headerH = masthead ? masthead.offsetHeight : 0;

    hairline();

    var scrollable = document.documentElement.scrollHeight - vh;
    bar.style.setProperty('--p', scrollable > 0 ? clamp(y / scrollable).toFixed(4) : 0);

    /* Hero eases back into a rounded card. Measured from layout offsets,
       not from the transformed box, so the scale cannot feed back on itself. */
    each('.hero.shrink', function (el) {
      if (!shown(el)) { return; }
      var start = el.offsetTop - headerH;
      el.style.setProperty('--p', clamp((y - start) / (el.offsetHeight * 0.85)).toFixed(4));
    });

    /* Statement lights up word by word as it crosses the screen. */
    each('.statement[data_words]', function (el) {
      if (!shown(el)) { return; }
      var r = el.getBoundingClientRect();
      var p = clamp((vh * 0.86 - r.top) / (r.height + vh * 0.42));
      var words = el.querySelectorAll('.w');
      var lit = Math.round(p * words.length);
      for (var i = 0; i < words.length; i++) {
        words[i].classList.toggle('on', i < lit);
      }
    });

    /* Service cards stack. Each one settles back a little as the next
       slides over it. */
    each('.stack', function (stack) {
      if (!shown(stack)) { return; }
      var cards = stack.querySelectorAll('.card');
      for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        var next = cards[i + 1];
        if (!next || !stacking.matches) { card.style.transform = ''; continue; }
        var gap = next.getBoundingClientRect().top - card.getBoundingClientRect().top;
        var t = clamp(1 - gap / card.offsetHeight);
        card.style.transform = 'scale(' + (1 - t * 0.05).toFixed(4) + ')';
      }
    });

    /* Band slides sideways with the scroll. */
    each('.band', function (el) {
      if (!shown(el)) { return; }
      var r = el.getBoundingClientRect();
      el.querySelector('.line').style.setProperty('--p', clamp((vh - r.top) / (vh + r.height)).toFixed(4));
    });

    /* Process line fills, and each step switches on as the line reaches it. */
    each('.steps', function (el) {
      if (!shown(el)) { return; }
      var r = el.getBoundingClientRect();
      var mark = vh * 0.62;
      el.querySelector('.fill').style.setProperty('--p', clamp((mark - r.top) / r.height).toFixed(4));
      Array.prototype.forEach.call(el.querySelectorAll('li'), function (li) {
        li.classList.toggle('on', li.getBoundingClientRect().top + 12 < mark);
      });
    });
  }

  var queued = false;
  function request() {
    if (queued) { return; }
    queued = true;
    window.requestAnimationFrame(function () { queued = false; frame(); });
  }

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);

  /* ----- Pointer light ----- */

  each('.hero.dark, .glow', function (el) {
    el.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') { return; }
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ----- Turning reduced motion on while the page is open ----- */

  if (calm && calm.addEventListener) {
    calm.addEventListener('change', function (e) {
      if (!e.matches) { return; }
      root.classList.remove('js_anim');
      showAll();
      bar.remove();
      each('.stack .card', function (c) { c.style.transform = ''; });
      window.removeEventListener('scroll', request);
      window.addEventListener('scroll', hairline, { passive: true });
    });
  }

  /* The single file preview swaps pages in and out, so a newly shown page
     needs observing and measuring again. */
  window.addEventListener('hashchange', function () {
    window.setTimeout(function () { watch(); request(); }, 60);
  });

  watch();
  frame();

})();
