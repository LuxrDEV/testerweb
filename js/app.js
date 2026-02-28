/* ============================================================
   STUDIOAI — app.js
   Shared utilities, navigation guards, helpers
   ============================================================ */

'use strict';

// ── Storage helpers ──────────────────────────────────────────
const store = {
  get: (key, def = null) => {
    try {
      const v = localStorage.getItem(key);
      return v !== null ? JSON.parse(v) : def;
    } catch { return def; }
  },
  set: (key, val) => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  },
  remove: (key) => { try { localStorage.removeItem(key); } catch {} }
};

// ── Auth guard ───────────────────────────────────────────────
function requireAuth() {
  const user = store.get('sai_user');
  if (!user) {
    window.location.href = 'index.html';
    return false;
  }
  return user;
}

function redirectIfLoggedIn() {
  const user = store.get('sai_user');
  if (user) window.location.href = 'dashboard.html';
}

// ── Toast ────────────────────────────────────────────────────
function toast(msg, type = 'default', duration = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const el = document.createElement('div');
  el.className = `toast${type !== 'default' ? ' ' + type : ''}`;

  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  el.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
  container.appendChild(el);

  setTimeout(() => {
    el.style.animation = 'toast-out 0.25s ease forwards';
    setTimeout(() => el.remove(), 250);
  }, duration);
}

// ── Format date ──────────────────────────────────────────────
function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'ahora';
  if (mins < 60)  return `hace ${mins}m`;
  if (hours < 24) return `hace ${hours}h`;
  if (days < 7)   return `hace ${days}d`;
  return new Date(date).toLocaleDateString('es', { day: 'numeric', month: 'short' });
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
}

// ── Escape HTML ───────────────────────────────────────────────
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Simple markdown → HTML (code blocks + inline code) ───────
function renderMarkdown(text) {
  let html = escapeHtml(text);

  // Code blocks ```lang\n...\n```
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><code class="lang-${lang || 'lua'}">${code.trim()}</code></pre>`;
  });

  // Inline code `...`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold **...**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic *...*
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Line breaks
  html = html.replace(/\n/g, '<br>');

  return html;
}

// ── Textarea auto-resize ──────────────────────────────────────
function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 160) + 'px';
}

// ── Populate user info in sidebar/topbar ─────────────────────
function populateUserUI(user) {
  const nameEls = document.querySelectorAll('[data-user-name]');
  const emailEls = document.querySelectorAll('[data-user-email]');
  const avatarEls = document.querySelectorAll('[data-user-avatar]');
  const initials = (user.name || user.email || 'U').slice(0, 2).toUpperCase();

  nameEls.forEach(el => { el.textContent = user.name || 'Usuario'; });
  emailEls.forEach(el => { el.textContent = user.email || ''; });
  avatarEls.forEach(el => { el.textContent = initials; });
}

// ── Expose globally ───────────────────────────────────────────
window.SAI = { store, requireAuth, redirectIfLoggedIn, toast, timeAgo, formatTime, renderMarkdown, autoResize, populateUserUI };