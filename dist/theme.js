// Apply a saved preference before painting the page.
try {
  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme === 'light') document.documentElement.dataset.theme = 'light';
} catch { /* Storage can be unavailable in private browsing. */ }
