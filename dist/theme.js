// Apply a saved preference before painting the page.
try {
  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme === 'light' || savedTheme === 'dark') document.documentElement.dataset.theme = savedTheme;
  if (localStorage.getItem('portfolio-lang') === 'en') document.documentElement.lang = 'en';
} catch { /* Storage can be unavailable in private browsing. */ }
