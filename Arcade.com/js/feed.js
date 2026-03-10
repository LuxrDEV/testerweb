// ==========================================
// FEED.JS — Renders the post feed & interactions
// ==========================================

const Feed = (() => {

  function renderPost(post) {
    const avatarBg = post.user.color || '#3b82f6';
    const hasMedia = post.type === 'video' || post.type === 'image';

    const mediaHTML = hasMedia ? `
      <div class="post-card__media">
        <div class="post-card__video-wrapper">
          <div style="height:200px;background:linear-gradient(135deg,#0a0a1a,#111122);display:flex;align-items:center;justify-content:center;">
            ${post.type === 'video' ? `
              <div class="post-card__video-play">
                <svg viewBox="0 0 24 24" fill="white" width="24" height="24"><path d="M8 5v14l11-7z"/></svg>
              </div>
              <div style="position:absolute;bottom:8px;left:12px;font-size:12px;color:#888;font-family:monospace;">${post.time}</div>
            ` : `
              <svg viewBox="0 0 24 24" fill="#333" width="48" height="48"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" opacity=".3"/><path d="M12 8v4M12 16h.01" stroke="#555" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
            `}
          </div>
        </div>
      </div>
    ` : '';

    const contentFormatted = post.content
      .replace(/#(\w+)/g, '<span class="post-card__hashtag">#$1</span>')
      .replace(/@(\w[\w.]+)/g, '<span class="post-card__mention">@$1</span>');

    return `
      <article class="post-card" data-post-id="${post.id}">
        <div class="post-card__header">
          <div class="avatar avatar-md" style="background:${avatarBg}22;color:${avatarBg};border:1px solid ${avatarBg}44;">
            ${post.user.initials}
          </div>
          <div class="post-card__user-info">
            <span class="post-card__username">${post.user.name}</span>
            <span class="post-card__handle"> @${post.user.handle}</span>
            <span class="post-card__time"> · ${post.time}</span>
          </div>
          <button class="post-card__dots btn-ghost">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
          </button>
        </div>
        <div class="post-card__content">${contentFormatted}</div>
        ${mediaHTML}
        <div class="post-card__actions">
          <button class="post-action post-action--comment" data-action="comment" data-id="${post.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span class="post-action__count">${post.comments || ''}</span>
          </button>
          <button class="post-action post-action--repost" data-action="repost" data-id="${post.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
            <span class="post-action__count">${post.reposts || ''}</span>
          </button>
          <button class="post-action post-action--like ${post.liked ? 'liked' : ''}" data-action="like" data-id="${post.id}">
            <svg viewBox="0 0 24 24" fill="${post.liked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <span class="post-action__count" id="like-count-${post.id}">${post.likes || ''}</span>
          </button>
          <button class="post-action post-action--chart" data-action="views" data-id="${post.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            <span class="post-action__count">${post.views || ''}</span>
          </button>
          <button class="post-action" data-action="save" data-id="${post.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            <span class="post-action__count">${post.saves || ''}</span>
          </button>
          <button class="post-action" data-action="share" data-id="${post.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          </button>
        </div>
      </article>
    `;
  }

  function renderFeed() {
    const container = document.getElementById('feed-posts');
    if (!container) return;
    container.innerHTML = AppData.posts.map(renderPost).join('');
    bindPostActions();
  }

  function bindPostActions() {
    document.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const postId = btn.dataset.id;
        handleAction(action, postId, btn);
      });
    });
  }

  function handleAction(action, postId, btn) {
    const post = AppData.posts.find(p => p.id === postId);
    if (!post) return;

    switch (action) {
      case 'like':
        post.liked = !post.liked;
        post.likes += post.liked ? 1 : -1;
        btn.classList.toggle('liked', post.liked);
        btn.querySelector('svg').setAttribute('fill', post.liked ? 'currentColor' : 'none');
        const countEl = document.getElementById(`like-count-${postId}`);
        if (countEl) countEl.textContent = post.likes || '';
        Toast.show(post.liked ? '❤️ Te gustó esta publicación' : 'Ya no te gusta');
        break;

      case 'save':
        post.saves += 1;
        Toast.show('🔖 Publicación guardada');
        break;

      case 'repost':
        Toast.show('🔁 Reposteado');
        break;

      case 'share':
        Toast.show('🔗 Enlace copiado');
        break;

      case 'comment':
        Toast.show('💬 Comentarios próximamente');
        break;
    }
  }

  return { renderFeed };
})();