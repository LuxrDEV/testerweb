/* ============================================================
   STUDIOAI — credits.js
   Credits management: get, spend, top-up
   ============================================================ */

'use strict';

window.Credits = (() => {
  const { store, toast } = window.SAI;

  const COSTS = {
    'roblox-ai':  3,
    'code-ai':    2,
    'general-ai': 2,
    'image-ai':   8,
    'debug-ai':   2
  };

  function getUser() {
    return store.get('sai_user');
  }

  function getBalance(email) {
    const u = email || getUser()?.email;
    if (!u) return 0;
    const all = store.get('sai_credits', {});
    return all[u] ?? 0;
  }

  function spend(amount, email) {
    const u = email || getUser()?.email;
    if (!u) return false;
    const all = store.get('sai_credits', {});
    const bal = all[u] ?? 0;
    if (bal < amount) return false;
    all[u] = bal - amount;
    store.set('sai_credits', all);
    dispatchUpdate(all[u]);
    return true;
  }

  function add(amount, email) {
    const u = email || getUser()?.email;
    if (!u) return;
    const all = store.get('sai_credits', {});
    all[u] = (all[u] ?? 0) + amount;
    store.set('sai_credits', all);
    dispatchUpdate(all[u]);
  }

  function canAfford(modelId) {
    const cost = COSTS[modelId] ?? 2;
    return getBalance() >= cost;
  }

  function getCost(modelId) {
    return COSTS[modelId] ?? 2;
  }

  function dispatchUpdate(balance) {
    document.dispatchEvent(new CustomEvent('credits-updated', { detail: { balance } }));
  }

  function renderBalance(el) {
    if (!el) return;
    el.textContent = getBalance();
  }

  // ── Top-up modal ─────────────────────────────────────────
  const PACKAGES = [
    { id: 'p1', credits: 100,  price: '$1.99',  popular: false },
    { id: 'p2', credits: 500,  price: '$7.99',  popular: true  },
    { id: 'p3', credits: 1500, price: '$19.99', popular: false },
  ];

  function showTopupModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal topup-modal">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
          <h3 style="font-family:var(--font-display);font-size:20px;font-weight:800">Comprar Créditos</h3>
          <button class="btn btn-ghost btn-sm" id="close-topup" style="color:var(--text-3)">✕</button>
        </div>
        <p style="font-size:13px;color:var(--text-2);margin-bottom:22px">Los créditos se usan para cada mensaje de IA. Nunca expiran.</p>
        <div class="topup-packages">
          ${PACKAGES.map(p => `
            <div class="topup-pkg${p.popular ? ' popular' : ''}" data-pkg="${p.id}" data-credits="${p.credits}">
              ${p.popular ? '<span class="pkg-badge">🔥 Más popular</span>' : ''}
              <div class="pkg-credits">${p.credits}</div>
              <div class="pkg-label">créditos</div>
              <div class="pkg-price">${p.price}</div>
            </div>
          `).join('')}
        </div>
        <div style="margin-top:20px;padding:14px;background:var(--green-bg);border:1px solid #BBF7D0;border-radius:var(--radius);font-size:13px;color:var(--green)">
          🎮 <strong>Demo:</strong> En esta versión, los créditos se añaden gratis. En producción conectarías Stripe.
        </div>
        <div class="topup-actions">
          <button class="btn btn-secondary" id="close-topup-2">Cancelar</button>
          <button class="btn btn-primary" id="confirm-topup">Agregar Créditos</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('open'));

    let selectedPkg = PACKAGES[1];

    overlay.querySelectorAll('.topup-pkg').forEach(el => {
      el.addEventListener('click', () => {
        overlay.querySelectorAll('.topup-pkg').forEach(p => p.classList.remove('selected'));
        el.classList.add('selected');
        selectedPkg = PACKAGES.find(p => p.id === el.dataset.pkg);
      });
    });

    // Select popular by default
    overlay.querySelector(`[data-pkg="p2"]`)?.classList.add('selected');

    const closeFn = () => {
      overlay.classList.remove('open');
      setTimeout(() => overlay.remove(), 200);
    };

    document.getElementById('close-topup').addEventListener('click', closeFn);
    document.getElementById('close-topup-2').addEventListener('click', closeFn);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeFn(); });

    document.getElementById('confirm-topup').addEventListener('click', async () => {
      const btn = document.getElementById('confirm-topup');
      btn.disabled = true;
      btn.innerHTML = '<div class="spinner"></div> Procesando...';
      await new Promise(r => setTimeout(r, 1200));
      add(selectedPkg.credits);
      toast(`+${selectedPkg.credits} créditos añadidos 🎉`, 'success');
      closeFn();
    });
  }

  return { getBalance, spend, add, canAfford, getCost, renderBalance, showTopupModal, COSTS };
})();

// Inject topup modal styles
const topupStyle = document.createElement('style');
topupStyle.textContent = `
  .topup-packages { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .topup-pkg { padding: 16px 12px; border: 2px solid var(--border); border-radius: var(--radius); text-align: center; cursor: pointer; transition: all 0.18s ease; position: relative; }
  .topup-pkg:hover { border-color: var(--accent-soft); }
  .topup-pkg.selected { border-color: var(--accent); background: var(--accent-bg); }
  .topup-pkg.popular { border-color: var(--accent-soft); }
  .pkg-badge { position: absolute; top: -10px; left: 50%; transform: translateX(-50%); font-size: 10px; background: var(--accent); color: #fff; padding: 2px 8px; border-radius: 999px; white-space: nowrap; font-weight: 600; }
  .pkg-credits { font-family: var(--font-display); font-size: 28px; font-weight: 800; color: var(--text); line-height: 1; }
  .pkg-label { font-size: 11px; color: var(--text-3); margin: 2px 0 8px; }
  .pkg-price { font-size: 15px; font-weight: 600; color: var(--accent); }
  .topup-actions { display: flex; gap: 10px; margin-top: 20px; justify-content: flex-end; }
`;
document.head.appendChild(topupStyle);