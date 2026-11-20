(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');
  document.getElementById('year').textContent = new Date().getFullYear();

  /* Hero tiles: shapes rotate into a new composition every few seconds (hover does it too) */
  const tiles = document.querySelector('.tiles');
  if (tiles && !reduceMotion) {
    setInterval(() => tiles.classList.toggle('spin'), 3200);
  }

  /* Fade blocks in as they scroll into view */
  if ('IntersectionObserver' in window && !reduceMotion) {
    const targets = document.querySelectorAll('.sec-head, .ai__card, .layer, .w, .job, .creds, .svc, .quotes figure');
    targets.forEach((el) => el.classList.add('reveal'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.12 });
    targets.forEach((el) => io.observe(el));
  }

  /* CTAs with data-intent preselect the matching topic in the contact form */
  const form = document.getElementById('contact-form');
  document.querySelectorAll('[data-intent]').forEach((a) => {
    a.addEventListener('click', () => {
      const radio = form.querySelector(`input[name="intent"][value="${a.dataset.intent}"]`);
      if (radio) radio.checked = true;
    });
  });

  /* Contact form: validate, then send to Formspark without leaving the page */
  const EMAIL = 'abbasmirza.b@gmail.com';
  const labels = { hiring: 'Role', freelance: 'Consulting project', tutoring: 'Tutoring' };
  const note = form.querySelector('.form__note');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll('[required]').forEach((f) => {
      const valid = f.checkValidity() && f.value.trim() !== '';
      f.setAttribute('aria-invalid', String(!valid));
      if (!valid) ok = false;
    });
    if (!ok) {
      note.textContent = 'Please add your name, a valid email and a message.';
      return;
    }
    const data = new FormData(form);
    const payload = {
      topic: labels[data.get('intent')] || 'Other',
      name: data.get('name').trim(),
      email: data.get('email').trim(),
      message: data.get('message').trim(),
    };
    if (data.get('_honeypot')) payload._honeypot = data.get('_honeypot');

    submitBtn.disabled = true;
    note.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      form.querySelectorAll('[aria-invalid]').forEach((f) => f.removeAttribute('aria-invalid'));
      note.textContent = "Thanks! Your message is on its way. I'll reply within a day.";
    } catch {
      note.textContent = `Sorry, that didn't go through. Please email me at ${EMAIL}.`;
    } finally {
      submitBtn.disabled = false;
    }
  });
})();
