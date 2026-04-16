// Runs before first paint to set data-theme on <html>, preventing FOUC.
// Keep as a source-of-truth string so layout inlines the exact same logic.

export const THEME_INIT_SCRIPT = `
(function(){
  try{
    var s = localStorage.getItem('theme');
    var theme = (s === 'dark' || s === 'light')
      ? s
      : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = theme;
  }catch(_){ document.documentElement.dataset.theme = 'light'; }
})();
`;
