/* ============================================================
   STUDIOAI — auth.js
   Login, register, Google OAuth mock, session management
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const { store, redirectIfLoggedIn, toast } = window.SAI;

  // Redirect if already logged in
  redirectIfLoggedIn();

  // ── Tab switching (login / register) ──────────────────────
  const tabBtns   = document.querySelectorAll('.auth-tab');
  const loginForm  = document.getElementById('login-form');
  const regForm    = document.getElementById('register-form');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      loginForm.classList.toggle('hidden', tab !== 'login');
      regForm.classList.toggle('hidden', tab !== 'register');
      clearErrors();
    });
  });

  // ── Login Form ─────────────────────────────────────────────
  const loginBtn = document.getElementById('login-btn');
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!validateEmail(email))   return showError('login-email', 'Email inválido');
    if (password.length < 6)     return showError('login-password', 'Mínimo 6 caracteres');

    setLoading(loginBtn, true);

    // Simulate API call
    await delay(900);

    const users = store.get('sai_users', {});
    const user  = users[email];

    if (!user) {
      setLoading(loginBtn, false);
      return showError('login-email', 'No existe una cuenta con este email');
    }

    if (user.password !== hashSimple(password)) {
      setLoading(loginBtn, false);
      return showError('login-password', 'Contraseña incorrecta');
    }

    // Login success
    store.set('sai_user', { email, name: user.name, plan: user.plan, created: user.created });
    toast('¡Bienvenido de nuevo, ' + user.name + '!', 'success');

    setTimeout(() => { window.location.href = 'dashboard.html'; }, 500);
  });

  // ── Register Form ──────────────────────────────────────────
  const regBtn = document.getElementById('register-btn');
  regForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const name     = document.getElementById('reg-name').value.trim();
    const email    = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirm  = document.getElementById('reg-confirm').value;

    if (!name)                    return showError('reg-name', 'Ingresa tu nombre');
    if (!validateEmail(email))    return showError('reg-email', 'Email inválido');
    if (password.length < 6)      return showError('reg-password', 'Mínimo 6 caracteres');
    if (password !== confirm)     return showError('reg-confirm', 'Las contraseñas no coinciden');

    setLoading(regBtn, true);
    await delay(1000);

    const users = store.get('sai_users', {});
    if (users[email]) {
      setLoading(regBtn, false);
      return showError('reg-email', 'Este email ya está registrado');
    }

    // Create user
    const newUser = {
      name,
      email,
      password: hashSimple(password),
      plan: 'free',
      created: new Date().toISOString()
    };

    users[email] = newUser;
    store.set('sai_users', users);

    // Give initial credits
    const allCredits = store.get('sai_credits', {});
    allCredits[email] = 100; // 100 free credits
    store.set('sai_credits', allCredits);

    // Auto login
    store.set('sai_user', { email, name, plan: 'free', created: newUser.created });
    toast('¡Cuenta creada! Tienes 100 créditos gratuitos 🎉', 'success');

    setTimeout(() => { window.location.href = 'dashboard.html'; }, 600);
  });

  // ── Google Login (Mock) ─────────────────────────────────────
  const googleBtns = document.querySelectorAll('.btn-google');
  googleBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      // Show mock Google popup
      showGoogleMock();
    });
  });

  // ── Quick links ────────────────────────────────────────────
  document.getElementById('go-register')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('[data-tab="register"]')?.click();
  });

  document.getElementById('go-login')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('[data-tab="login"]')?.click();
  });

  // ── Toggle password visibility ─────────────────────────────
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.for);
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
      btn.textContent = input.type === 'password' ? '👁' : '🙈';
    });
  });

  // ────────────────────────────────────────────────────────────
  //  Google Mock Modal
  // ────────────────────────────────────────────────────────────
  function showGoogleMock() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal google-modal">
        <div class="google-modal-header">
          <svg viewBox="0 0 48 48" width="40" height="40">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          <h3>Iniciar sesión con Google</h3>
          <p>Elige una cuenta para continuar</p>
        </div>
        <div class="google-accounts">
          <div class="google-account" data-name="Demo User" data-email="demo@gmail.com">
            <div class="g-avatar">D</div>
            <div>
              <div class="g-name">Demo User</div>
              <div class="g-email">demo@gmail.com</div>
            </div>
          </div>
          <div class="google-account" data-name="Otro Usuario" data-email="otro@gmail.com">
            <div class="g-avatar" style="background:#4285F4">O</div>
            <div>
              <div class="g-name">Otro Usuario</div>
              <div class="g-email">otro@gmail.com</div>
            </div>
          </div>
          <div class="google-account add-account">
            <div class="g-avatar" style="background:#eee;color:#666">+</div>
            <div>
              <div class="g-name">Usar otra cuenta</div>
            </div>
          </div>
        </div>
        <button class="btn btn-ghost btn-sm" id="close-google">Cancelar</button>
      </div>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('open'));

    overlay.querySelectorAll('.google-account:not(.add-account)').forEach(el => {
      el.addEventListener('click', async () => {
        const name  = el.dataset.name;
        const email = el.dataset.email;
        overlay.classList.remove('open');
        setTimeout(() => overlay.remove(), 200);

        // Auto-create or login Google user
        const users = store.get('sai_users', {});
        if (!users[email]) {
          users[email] = { name, email, password: null, plan: 'free', created: new Date().toISOString(), google: true };
          store.set('sai_users', users);
          const allCredits = store.get('sai_credits', {});
          allCredits[email] = 100;
          store.set('sai_credits', allCredits);
        }

        store.set('sai_user', { email, name, plan: users[email].plan, created: users[email].created, google: true });
        toast('¡Bienvenido, ' + name + '!', 'success');
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 500);
      });
    });

    document.getElementById('close-google').addEventListener('click', () => {
      overlay.classList.remove('open');
      setTimeout(() => overlay.remove(), 200);
    });

    overlay.addEventListener('click', e => {
      if (e.target === overlay) {
        overlay.classList.remove('open');
        setTimeout(() => overlay.remove(), 200);
      }
    });
  }

  // ────────────────────────────────────────────────────────────
  //  Helpers
  // ────────────────────────────────────────────────────────────
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showError(fieldId, msg) {
    const input = document.getElementById(fieldId);
    if (input) input.classList.add('error');
    const errEl = document.getElementById(fieldId + '-err');
    if (errEl) errEl.textContent = msg;
  }

  function clearErrors() {
    document.querySelectorAll('.input-field').forEach(i => i.classList.remove('error'));
    document.querySelectorAll('.field-error').forEach(e => e.textContent = '');
  }

  function setLoading(btn, loading) {
    if (!btn) return;
    btn.disabled = loading;
    btn.innerHTML = loading
      ? `<div class="spinner"></div> <span>Cargando...</span>`
      : btn.dataset.label;
  }

  function hashSimple(str) {
    // Simple non-crypto hash just for demo purposes
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h) + str.charCodeAt(i);
      h |= 0;
    }
    return h.toString(16);
  }

  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  // Set button labels as data attribute
  document.querySelectorAll('.btn[id$="-btn"]').forEach(btn => {
    btn.dataset.label = btn.innerHTML;
  });
});

// Google modal styles (injected)
const gStyle = document.createElement('style');
gStyle.textContent = `
  .google-modal { max-width: 380px; }
  .google-modal-header { text-align: center; padding-bottom: 20px; }
  .google-modal-header h3 { font-family: var(--font-display); font-size: 18px; font-weight: 700; margin: 10px 0 4px; }
  .google-modal-header p { font-size: 13px; color: var(--text-2); }
  .google-modal-header svg { margin: 0 auto; }
  .google-accounts { display: flex; flex-direction: column; gap: 4px; margin-bottom: 16px; }
  .google-account { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: var(--radius); cursor: pointer; transition: background var(--transition); }
  .google-account:hover { background: var(--surface-2); }
  .g-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--accent); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; }
  .g-name { font-size: 14px; font-weight: 500; color: var(--text); }
  .g-email { font-size: 12px; color: var(--text-3); }
  .hidden { display: none !important; }
`;
document.head.appendChild(gStyle);