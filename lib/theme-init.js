// Runs in <head> before first paint to set data-theme on <html>, preventing FOUC.
// Keep as a source-of-truth string so layout inlines the exact same logic.

export const THEME_INIT_SCRIPT = `
(function(){
  try{
    var stored = localStorage.getItem('theme');
    var cookieMatch = document.cookie.match(/(?:^|; )theme=(dark|light)(?:;|$)/);
    var cookieTheme = cookieMatch ? cookieMatch[1] : null;
    var systemTheme = globalThis.matchMedia && globalThis.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    var theme = (stored === 'dark' || stored === 'light') ? stored : (cookieTheme || systemTheme);
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.cookie = 'theme=' + theme + '; Path=/; Max-Age=31536000; SameSite=Lax';
  }catch(_){
    document.documentElement.dataset.theme = 'light';
    document.documentElement.style.colorScheme = 'light';
  }
})();
`;
