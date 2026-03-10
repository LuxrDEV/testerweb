// ==========================================
// NAVIGATION.JS — Page routing & nav state
// ==========================================

const Navigation = (() => {
  let currentPage = 'feed';

  const pages = ['feed', 'communities', 'explore', 'activity', 'messages', 'profile'];

  function init() {
    // Sidebar nav clicks
    document.querySelectorAll('[data-page]').forEach(el => {
      el.addEventListener('click', () => {
        const target = el.dataset.page;
        navigate(target);
      });
    });

    // Create post button
    document.querySelectorAll('.btn-create-post, .bottom-nav__plus').forEach(el => {
      el.addEventListener('click', () => Modal.open('create-post'));
    });
  }

  function navigate(page) {
    if (!pages.includes(page)) return;

    // Deactivate all
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('[data-page]').forEach(el => el.classList.remove('active'));

    // Activate target
    const pageEl = document.getElementById(`page-${page}`);
    if (pageEl) pageEl.classList.add('active');

    document.querySelectorAll(`[data-page="${page}"]`).forEach(el => el.classList.add('active'));

    currentPage = page;

    // Scroll to top
    window.scrollTo(0, 0);
  }

  function getCurrent() {
    return currentPage;
  }

  return { init, navigate, getCurrent };
})();