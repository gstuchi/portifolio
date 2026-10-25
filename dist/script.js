const root = document.documentElement;
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const darkScheme = matchMedia('(prefers-color-scheme: dark)');
const isEnglish = () => root.lang === 'en';
const t = (pt, en) => (isEnglish() ? en : pt);
const store = (key, value) => { try { localStorage.setItem(key, value); } catch { /* Keep the in-page preference. */ } };

// Language: every translatable node carries data-pt / data-en (and data-label-* for aria-labels).
const languageButton = $('#language');
const languageListeners = [];
function applyLanguage() {
  const key = isEnglish() ? 'en' : 'pt';
  $$('[data-pt]').forEach(element => { element.innerHTML = element.dataset[key]; });
  $$('[data-label-pt]').forEach(element => element.setAttribute('aria-label', element.dataset[key === 'en' ? 'labelEn' : 'labelPt']));
  $$('[data-alt-pt]').forEach(element => { element.alt = element.dataset[key === 'en' ? 'altEn' : 'altPt']; });
  languageButton.textContent = isEnglish() ? 'PT' : 'EN';
  languageButton.setAttribute('aria-label', isEnglish() ? 'Mudar para português' : 'Switch to English');
  $('.side').setAttribute('aria-label', t('Perfil', 'Profile'));
  languageListeners.forEach(listener => listener());
}
languageButton.addEventListener('click', () => {
  root.lang = isEnglish() ? 'pt-BR' : 'en';
  store('portfolio-lang', isEnglish() ? 'en' : 'pt');
  applyLanguage();
});

// Theme: explicit choice wins, otherwise follow the system.
const themeButton = $('.theme');
const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : darkScheme.matches;
function updateThemeControl() {
  themeButton.setAttribute('aria-pressed', String(isDark()));
  themeButton.setAttribute('aria-label', t('Tema escuro', 'Dark theme'));
  themeButton.title = t('Alternar tema claro e escuro', 'Toggle light and dark theme');
  $('meta[name="theme-color"]').content = isDark() ? '#262624' : '#faf9f5';
}
themeButton.addEventListener('click', () => {
  root.dataset.theme = isDark() ? 'light' : 'dark';
  store('portfolio-theme', root.dataset.theme);
  updateThemeControl();
});
darkScheme.addEventListener('change', updateThemeControl);
languageListeners.push(updateThemeControl);

// Motion is progressive: without it every section is simply visible.
if (!reducedMotion.matches) root.classList.add('motion');
reducedMotion.addEventListener('change', event => root.classList.toggle('motion', !event.matches));
const reveals = $$('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.dataset.in = '';
    revealObserver.unobserve(entry.target);
  }), { rootMargin: '0px 0px -40px 0px' });
  reveals.forEach(section => revealObserver.observe(section));
} else {
  reveals.forEach(section => { section.dataset.in = ''; });
}
// Deep links and keyboard focus never wait for an animation.
const showSection = section => { if (section) section.dataset.in = ''; };
addEventListener('hashchange', () => showSection(document.getElementById(location.hash.slice(1))));
document.addEventListener('focusin', event => showSection(event.target.closest('.reveal')));
if (location.hash) showSection(document.getElementById(location.hash.slice(1)));

// Signature writes itself on load and again on click.
const signature = $('.sig');
function sign() {
  signature.classList.remove('write');
  void signature.offsetWidth;
  signature.classList.add('write');
}
signature.addEventListener('click', sign);
sign();

// Sliding pill behind the active tab or nav link.
function movePill(pill, target) {
  if (!target) { pill.style.opacity = '0'; return; }
  pill.style.opacity = '1';
  pill.style.width = `${target.offsetWidth}px`;
  pill.style.transform = `translateX(${target.offsetLeft}px)`;
}

// Nav: border once stuck, active section highlighted.
const nav = $('.nav');
const navPill = $('.links .pill');
const navItems = $$('.links a').map(link => ({ link, section: $(link.getAttribute('href')) }));
let framePending = false;
function updateNav() {
  framePending = false;
  nav.toggleAttribute('data-stuck', scrollY > 4);
  const readingLine = Math.min(innerHeight * .4, 300);
  let active;
  navItems.forEach(item => { if (item.section.getBoundingClientRect().top <= readingLine) active = item; });
  if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) active = undefined;
  navItems.forEach(item => item.link.toggleAttribute('aria-current', item === active));
  if (active) active.link.setAttribute('aria-current', 'location');
  movePill(navPill, active?.link);
}
const scheduleNav = () => { if (!framePending) { framePending = true; requestAnimationFrame(updateNav); } };
addEventListener('scroll', scheduleNav, { passive: true });
addEventListener('resize', scheduleNav);
languageListeners.push(scheduleNav);
updateNav();

// Tab groups (projects and skills) share the same behaviour.
function setupTabs(group, onSelect) {
  const buttons = $$('button', group);
  const pill = $('.tab-pill', group);
  const sync = () => movePill(pill, buttons.find(button => button.getAttribute('aria-pressed') === 'true'));
  buttons.forEach(button => button.addEventListener('click', () => {
    buttons.forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    sync();
    onSelect(button.dataset.filter);
  }));
  addEventListener('resize', sync);
  languageListeners.push(sync);
  sync();
}
function fadeIn(element) {
  if (!reducedMotion.matches) element.animate([{ opacity: .3 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' });
}

const projects = $$('.project');
const projectStatus = $('.filter-status');
function updateProjectStatus() {
  const count = projects.filter(project => !project.hidden).length;
  projectStatus.textContent = t(`${count} ${count === 1 ? 'projeto' : 'projetos'}`, `${count} ${count === 1 ? 'project' : 'projects'}`);
}
setupTabs($('.project-tabs'), filter => {
  projects.forEach(project => {
    project.hidden = filter !== 'all' && !project.dataset.tags.split(' ').includes(filter);
    if (!project.hidden) fadeIn(project);
  });
  updateProjectStatus();
});
languageListeners.push(updateProjectStatus);

// Skills: 20-segment meters that fill in sequence whenever a category is shown.
const skills = $$('.skill');
skills.forEach(skill => {
  const level = Number(skill.dataset.level);
  $('.meter', skill).append(...Array.from({ length: 20 }, (_, index) => {
    const segment = document.createElement('i');
    segment.style.setProperty('--i', index);
    if (index < level) segment.dataset.on = '';
    return segment;
  }));
});
function fillSkills() {
  const visible = skills.filter(skill => !skill.hidden);
  visible.forEach(skill => skill.removeAttribute('data-filled'));
  void $('.skills').offsetWidth; // Commit the empty state so the fill transitions run.
  visible.forEach(skill => { skill.dataset.filled = ''; });
}
setupTabs($('.skill-tabs'), filter => {
  skills.forEach(skill => { skill.hidden = skill.dataset.cat !== filter; });
  fillSkills();
});
if ('IntersectionObserver' in window) {
  const skillsObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    fillSkills();
    skillsObserver.disconnect();
  }, { threshold: .25 });
  skillsObserver.observe($('.skills'));
} else {
  fillSkills();
}

// Experience: clicking a tag highlights every role that used it.
const entries = $$('#experience .entry');
const tagButtons = $$('#experience .tags button');
const filterBar = $('#experience .filter');
let highlighted = null;
function highlight(name) {
  highlighted = name;
  tagButtons.forEach(button => button.setAttribute('aria-pressed', String(button.textContent === name)));
  entries.forEach(entry => {
    const hit = !!name && $$('.tags button', entry).some(button => button.textContent === name);
    entry.toggleAttribute('data-hit', hit);
    entry.toggleAttribute('data-dim', !!name && !hit);
  });
  filterBar.hidden = !name;
  $('.filter-name', filterBar).textContent = name || '';
}
tagButtons.forEach(button => {
  button.setAttribute('aria-pressed', 'false');
  button.addEventListener('click', () => highlight(highlighted === button.textContent ? null : button.textContent));
});
$('.filter-clear').addEventListener('click', () => highlight(null));
languageListeners.push(() => highlight(null));

// Durations are computed so they never go stale.
function formatDuration(months) {
  const years = Math.floor(months / 12), rest = months % 12;
  const parts = [];
  if (years) parts.push(t(`${years} ${years === 1 ? 'ano' : 'anos'}`, `${years} ${years === 1 ? 'yr' : 'yrs'}`));
  if (rest) parts.push(t(`${rest} ${rest === 1 ? 'mês' : 'meses'}`, `${rest} ${rest === 1 ? 'mo' : 'mos'}`));
  return parts.join(' ');
}
function updateDurations() {
  const now = new Date();
  $$('.date[data-start]').forEach(date => {
    const [startYear, startMonth] = date.dataset.start.split('-').map(Number);
    const [endYear, endMonth] = date.dataset.end ? date.dataset.end.split('-').map(Number) : [now.getFullYear(), now.getMonth() + 1];
    const months = Math.max(1, (endYear - startYear) * 12 + (endMonth - startMonth) + 1);
    $('.dur', date).textContent = formatDuration(months);
  });
}
languageListeners.push(updateDurations);

// Education coursework folds.
$$('.edu .more').forEach(button => button.addEventListener('click', () => {
  const open = button.getAttribute('aria-expanded') !== 'true';
  button.setAttribute('aria-expanded', String(open));
  button.nextElementSibling.toggleAttribute('data-open', open);
}));

// Copy email with a toast; without clipboard access the toast shows the address.
const toast = $('.toast');
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.dataset.show = '';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => delete toast.dataset.show, 2200);
}
$$('.copy-email').forEach(button => button.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('stuchigiovani@gmail.com');
    showToast(t('E-mail copiado', 'Email copied'));
  } catch {
    showToast('stuchigiovani@gmail.com');
  }
}));

// Image viewer for project galleries.
const viewer = $('.viewer');
const viewerImage = $('.viewer-img img');
let viewerImages = [], viewerIndex = 0;
function showImage(index) {
  viewerIndex = (index + viewerImages.length) % viewerImages.length;
  const image = viewerImages[viewerIndex];
  viewerImage.src = image.getAttribute('src');
  viewerImage.alt = image.alt;
  $('.viewer-pos').textContent = `${viewerIndex + 1} / ${viewerImages.length}`;
}
function updateViewerLabels() {
  $('.viewer-close').setAttribute('aria-label', t('Fechar', 'Close'));
  $('.viewer-prev').setAttribute('aria-label', t('Imagem anterior', 'Previous image'));
  $('.viewer-next').setAttribute('aria-label', t('Próxima imagem', 'Next image'));
}
$$('.gallery').forEach(gallery => {
  const links = $$('a', gallery);
  links.forEach((link, index) => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || !viewer.showModal) return;
      event.preventDefault();
      viewerImages = links.map(item => $('img', item));
      $('#viewer-title').textContent = $('h3', gallery.closest('.project')).textContent;
      $('.viewer-controls').hidden = viewerImages.length < 2;
      showImage(index);
      viewer.showModal();
      $('.viewer-close').focus();
    });
  });
});
$('.viewer-close').addEventListener('click', () => viewer.close());
$('.viewer-prev').addEventListener('click', () => showImage(viewerIndex - 1));
$('.viewer-next').addEventListener('click', () => showImage(viewerIndex + 1));
viewer.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
viewer.addEventListener('keydown', event => {
  if (viewerImages.length < 2) return;
  if (event.key === 'ArrowLeft') { event.preventDefault(); showImage(viewerIndex - 1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); showImage(viewerIndex + 1); }
});
languageListeners.push(updateViewerLabels);

$('#year').textContent = new Date().getFullYear();
applyLanguage();
