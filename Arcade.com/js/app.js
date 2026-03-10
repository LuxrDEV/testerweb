// ==========================================
// APP.JS — Main app initialization
// ==========================================

// ---- TOAST ----
const Toast = (() => {
  let timeout;
  const el = document.getElementById('toast');

  function show(message, duration = 2500) {
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(timeout);
    timeout = setTimeout(() => el.classList.remove('show'), duration);
  }

  return { show };
})();

// ---- MODAL ----
const Modal = (() => {
  function open(id) {
    const overlay = document.getElementById(`modal-${id}`);
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close(id) {
    const overlay = document.getElementById(`modal-${id}`);
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function init() {
    // Close on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('open');
          document.body.style.overflow = '';
        }
      });
    });

    // Close buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.closeModal;
        close(id);
      });
    });

    // Post submit
    const postBtn = document.getElementById('submit-post');
    if (postBtn) {
      postBtn.addEventListener('click', submitPost);
    }
  }

  function submitPost() {
    const textarea = document.getElementById('new-post-text');
    if (!textarea) return;
    const text = textarea.value.trim();
    if (!text) {
      Toast.show('Escribe algo primero ✍️');
      return;
    }

    // Add to data
    const newPost = {
      id: 'p' + Date.now(),
      user: AppData.currentUser,
      content: text,
      time: 'Ahora',
      type: 'text',
      likes: 0,
      reposts: 0,
      comments: 0,
      views: 0,
      saves: 0,
      liked: false,
    };

    AppData.posts.unshift(newPost);
    Feed.renderFeed();
    textarea.value = '';
    close('create-post');
    Navigation.navigate('feed');
    Toast.show('✅ Publicado exitosamente');
  }

  return { init, open, close };
})();

// ---- SIDEBAR ----
const Sidebar = (() => {
  function renderUser() {
    const user = AppData.currentUser;
    const el = document.getElementById('sidebar-user');
    if (!el) return;
    el.innerHTML = `
      <div class="sidebar__user-avatar">${user.initials}</div>
      <div class="sidebar__user-info">
        <div class="sidebar__user-name">${user.name}</div>
        <div class="sidebar__user-handle">@${user.handle}</div>
      </div>
    `;
    el.addEventListener('click', () => Navigation.navigate('profile'));
  }

  return { renderUser };
})();

// ---- RIGHT SIDEBAR ----
const RightSidebar = (() => {
  function renderTrends() {
    const el = document.getElementById('right-trends');
    if (!el) return;
    el.innerHTML = AppData.trends.slice(0, 5).map(t => `
      <div class="trend-item">
        <span class="trend-item__rank">${t.rank}</span>
        <div class="trend-item__icon">🔥</div>
        <div class="trend-item__info">
          <div class="trend-item__label">
            Tendencia
            ${t.hot ? '<span class="trend-item__fire-badge">🔥 En llamas</span>' : ''}
          </div>
          <div class="trend-item__tag">${t.tag}</div>
          <div class="trend-item__count">🔥 ${t.mentions} menciones</div>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" width="16" height="16"><path d="M9 18l6-6-6-6"/></svg>
      </div>
    `).join('');
  }

  function renderSuggested() {
    const el = document.getElementById('right-suggested');
    if (!el) return;
    el.innerHTML = AppData.suggestedUsers.map(u => `
      <div class="follow-item">
        <div class="avatar avatar-md" style="background:#1a1a2e;color:#3b82f6;border:1px solid #1e3a5f;">
          ${u.initials}
        </div>
        <div class="follow-item__info">
          <div class="follow-item__name">${u.name.length > 18 ? u.name.slice(0, 18) + '…' : u.name}</div>
          <div class="follow-item__handle">@${u.handle.length > 16 ? u.handle.slice(0, 16) + '…' : u.handle}</div>
        </div>
        <button class="btn btn-outline btn-sm" onclick="Toast.show('Siguiendo a @${u.handle}')">Seguir</button>
      </div>
    `).join('');
  }

  return { renderTrends, renderSuggested };
})();

// ---- EXPLORE PAGE ----
const Explore = (() => {
  function renderTrends() {
    const el = document.getElementById('explore-trends');
    if (!el) return;
    el.innerHTML = AppData.trends.map(t => `
      <div class="trend-item">
        <span class="trend-item__rank">${t.rank}</span>
        <div class="trend-item__icon">🔥</div>
        <div class="trend-item__info">
          <div class="trend-item__label">
            Tendencia
            ${t.hot ? '<span class="trend-item__fire-badge">🔥 En llamas</span>' : ''}
          </div>
          <div class="trend-item__tag">${t.tag}</div>
          <div class="trend-item__count">🔥 ${t.mentions} menciones</div>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" width="16" height="16"><path d="M9 18l6-6-6-6"/></svg>
      </div>
    `).join('');
  }

  return { renderTrends };
})();

// ---- ACTIVITY PAGE ----
const Activity = (() => {
  const typeIcons = {
    like: { icon: `<svg viewBox="0 0 24 24" fill="white" width="10" height="10"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l7.78 7.78 7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`, class: '' },
    save: { icon: `<svg viewBox="0 0 24 24" fill="white" width="10" height="10"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`, class: 'save-icon' },
    repost: { icon: `<svg viewBox="0 0 24 24" fill="white" width="10" height="10"><path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3"/></svg>`, class: 'repost-icon' },
    follow: { icon: `<svg viewBox="0 0 24 24" fill="white" width="10" height="10"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6"/></svg>`, class: 'follow-icon' },
  };

  const labels = {
    like: 'le gustó tu publicación',
    save: 'guardó tu publicación',
    repost: 'reposteó tu publicación',
    follow: 'comenzó a seguirte',
  };

  function render() {
    const el = document.getElementById('activity-list');
    if (!el) return;

    const colors = ['#3b82f6', '#8b5cf6', '#f97316', '#22c55e', '#ef4444', '#f59e0b'];

    el.innerHTML = `
      <div class="section-header" style="padding:16px 20px 8px;">HOY</div>
      ${AppData.activity.map((item, i) => {
        const t = typeIcons[item.type] || typeIcons.like;
        return `
          <div class="activity-item">
            <div class="activity-item__icon-wrapper">
              <div class="avatar avatar-md" style="background:${colors[i % colors.length]}22;color:${colors[i % colors.length]};border:1px solid ${colors[i % colors.length]}44;">
                ${item.user.slice(0, 2).toUpperCase()}
              </div>
              <div class="activity-item__type-icon ${t.class}">${t.icon}</div>
            </div>
            <div class="activity-item__content">
              <div><strong>Nuevo ${item.type === 'save' ? 'guardado' : 'like'}</strong> ${item.user} ${labels[item.type]}</div>
              <div class="activity-item__time">${item.time}</div>
            </div>
          </div>
        `;
      }).join('')}
    `;
  }

  return { render };
})();

// ---- COMMUNITIES PAGE ----
const Communities = (() => {
  function render() {
    const el = document.getElementById('communities-grid');
    if (!el) return;

    const banners = {
      'gradient-blue': 'linear-gradient(135deg, #0a0a2e 0%, #0d2060 50%, #1a3a8f 100%)',
      'gradient-dark': 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)',
    };

    let html = AppData.communities.map(c => `
      <div class="community-card" onclick="Toast.show('Abriendo ${c.name}...')">
        <div class="community-card__banner" style="background:${banners[c.banner] || banners['gradient-dark']};">
          <div class="community-card__logo" style="color:${c.color};font-weight:800;">${c.name[0]}</div>
          <div class="community-card__active-dot"></div>
        </div>
        ${c.joined ? `<div class="community-card__joined"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" width="14" height="14"><path d="M20 6L9 17l-5-5"/></svg></div>` : ''}
        <div class="community-card__body">
          <div class="community-card__name">${c.name}</div>
          <div class="community-card__members">${c.members} miembros</div>
        </div>
      </div>
    `).join('');

    html += `
      <div class="community-card community-card--create" onclick="Toast.show('Crear comunidad próximamente')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        <span>Crear</span>
      </div>
    `;

    el.innerHTML = html;

    // Explore communities
    const exploreEl = document.getElementById('explore-communities-list');
    if (exploreEl) {
      exploreEl.innerHTML = AppData.exploreCommunities.map(c => `
        <div class="follow-item" style="padding:16px 20px;border-bottom:1px solid var(--border);">
          <div class="avatar avatar-md" style="background:#1a1a2e;font-size:18px;">${c.initials}</div>
          <div class="follow-item__info">
            <div class="follow-item__name">${c.name}</div>
            <div class="follow-item__handle">${c.members} miembros · ${c.category}</div>
          </div>
          <button class="btn btn-outline btn-sm" onclick="Toast.show('Uniéndote a ${c.name}...')">Unirse</button>
        </div>
      `).join('');
    }
  }

  return { render };
})();

// ---- PROFILE PAGE ----
const Profile = (() => {
  function render() {
    const user = AppData.currentUser;
    const el = document.getElementById('profile-content');
    if (!el) return;
    document.getElementById('profile-name').textContent = user.name;
    document.getElementById('profile-handle-text').textContent = `@${user.handle}`;
    document.getElementById('profile-bio-text').textContent = user.bio;
    document.getElementById('profile-join').textContent = `Se unió en ${user.joinDate}`;
    document.getElementById('profile-following').textContent = user.following;
    document.getElementById('profile-followers').textContent = user.followers;
    document.getElementById('profile-likes').textContent = user.likes;

    // Profile posts
    const myPosts = AppData.posts.filter(p => p.user.id === 'u1');
    const postsEl = document.getElementById('profile-posts');
    if (postsEl) {
      postsEl.innerHTML = myPosts.length
        ? myPosts.map(p => Feed.renderPost ? '' : '').join('') // reuse from feed
        : `<div style="padding:40px;text-align:center;color:var(--text-muted);">No hay publicaciones aún</div>`;
    }
  }

  return { render };
})();

// ---- MESSAGES PAGE ----
const Messages = (() => {
  function render() {
    const el = document.getElementById('groups-list');
    if (!el) return;
    el.innerHTML = AppData.groups.map(g => `
      <div class="chat-item" onclick="Toast.show('Chat de ${g.name}')">
        <div class="avatar avatar-md" style="background:#0a0a1e;font-size:${g.icon === 'A' ? '16px' : '18px'};font-weight:800;color:#fff;border:1px solid #222;">
          ${g.icon}
        </div>
        <div class="chat-item__info">
          <div class="chat-item__name">${g.name}</div>
          <div class="chat-item__sub">${g.category}</div>
        </div>
        <div class="chat-item__count">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          ${g.members}
        </div>
      </div>
    `).join('');
  }

  return { render };
})();

// ==========================================
// INIT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize all modules
  Navigation.init();
  Modal.init();
  Sidebar.renderUser();
  Feed.renderFeed();
  RightSidebar.renderTrends();
  RightSidebar.renderSuggested();
  Explore.renderTrends();
  Activity.render();
  Communities.render();
  Messages.render();
  Profile.render();

  // Search input
  document.querySelectorAll('.search-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      if (query.length > 1) {
        Navigation.navigate('explore');
      }
    });
  });

  // Tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.dataset.tabGroup;
      const target = btn.dataset.tab;
      document.querySelectorAll(`[data-tab-group="${group}"]`).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll(`[data-tab-content="${group}"]`).forEach(el => {
        el.style.display = el.dataset.tabPanel === target ? 'block' : 'none';
      });
    });
  });

  // Post char counter
  const newPostText = document.getElementById('new-post-text');
  const charCounter = document.getElementById('char-counter');
  if (newPostText && charCounter) {
    newPostText.addEventListener('input', () => {
      const len = newPostText.value.length;
      charCounter.textContent = `${len}/280`;
      charCounter.style.color = len > 250 ? 'var(--accent-red)' : 'var(--text-muted)';
    });
  }
});