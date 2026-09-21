/* Rafter Technologies
   Mobile navigation and accessible form validation.
   No dependencies. */

(function () {
  'use strict';

  /* ----- Mobile navigation ----- */

  var toggle = document.querySelector('.navtoggle');
  var nav = document.getElementById('sitenav');

  if (toggle && nav) {
    var mq = window.matchMedia('(max-width: 900px)');

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

  form.addEventListener('submit', function (e) {
    var failed = [];

    rules.forEach(function (rule) {
      if (!validateOne(rule)) { failed.push(rule); }
    });

    if (failed.length) {
      e.preventDefault();
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

    /* Demo mode. Remove data_demo once a real endpoint is set on the form. */
    if (form.getAttribute('data_demo') === 'true') {
      e.preventDefault();
      sent.textContent = 'Thank you. This form is not connected to an inbox yet, so nothing has been sent. Set the form action to a real endpoint to start receiving messages.';
      sent.hidden = false;
      sent.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  });

})();
