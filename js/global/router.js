// js/global/router.js
// Navigation helpers. All paths are relative to pages/ (where every
// page script that imports this module lives).

export const goToHome     = ()    => window.location.href = 'home.html';
export const goToLogin    = ()    => window.location.href = 'login.html';
export const goToPost     = (id)  => window.location.href = `post.html?id=${id}`;
export const goToUser     = (id)  => window.location.href = `user.html?id=${id}`;
export const goToSettings = ()    => window.location.href = 'settings.html';
