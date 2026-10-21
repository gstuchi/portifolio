const projectItems = [...document.querySelectorAll('#projects .project')];
const isEnglish = () => document.documentElement.lang === 'en';
const filters = document.createElement('div');
filters.className = 'project-filters';
filters.setAttribute('role', 'group');
filters.setAttribute('aria-label', 'Filtrar projetos');
const categories = [
  ['all', 'Todos', 'All'], ['ios', 'iOS', 'iOS'],
  ['web', 'Web', 'Web'], ['ai', 'Inteligência artificial', 'Artificial intelligence']
];
const projectCategories = [['ios', 'web'], ['web'], ['ai', 'web']];
let selectedFilter = 'all';
const filterStatus = document.createElement('p');
filterStatus.className = 'filter-status';
filterStatus.setAttribute('role', 'status');
function updateFilterStatus() {
  const count = projectItems.filter(item => !item.hidden).length;
  filterStatus.textContent = isEnglish() ? `${count} projects` : `${count} projetos`;
  filters.setAttribute('aria-label', isEnglish() ? 'Filter projects' : 'Filtrar projetos');
  window.dispatchEvent(new Event('resize'));
}
categories.forEach(([key, pt, en]) => {
  const button = document.createElement('button');
  button.type = 'button'; button.dataset.pt = pt; button.dataset.en = en;
  button.textContent = pt; button.setAttribute('aria-pressed', String(key === selectedFilter));
  button.addEventListener('click', () => {
    selectedFilter = key;
    filters.querySelectorAll('button').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    projectItems.forEach((item, index) => {
      item.hidden = key !== 'all' && !projectCategories[index].includes(key);
      if (!item.hidden && !motionPreference.matches) {
        item.animate([{opacity: .3}, {opacity: 1}], {duration: 220, easing: 'ease-out'});
      }
    });
    updateFilterStatus();
  });
  filters.append(button);
});
document.querySelector('#projects .section-heading').after(filters, filterStatus);
document.querySelector('#language').addEventListener('click', updateFilterStatus);
updateFilterStatus();

const projectDialog = document.createElement('dialog');
projectDialog.className = 'project-dialog';
projectDialog.setAttribute('aria-labelledby', 'project-dialog-title');
projectDialog.innerHTML = `<div class="dialog-shell"><div class="dialog-top"><span class="eyebrow">SELECTED WORK</span><button type="button" class="dialog-close" aria-label="Fechar detalhes">✕</button></div><div class="dialog-body"><div class="dialog-gallery"><div class="dialog-image-wrap"><img class="dialog-image" alt=""></div><div class="dialog-controls"><button type="button" class="gallery-prev" aria-label="Imagem anterior">←</button><span class="gallery-position" role="status"></span><button type="button" class="gallery-next" aria-label="Próxima imagem">→</button></div></div><div class="dialog-description"></div></div></div>`;
document.body.append(projectDialog);
let openProject, activeImage = 0, projectImages = [], previousOverflow = '';
const dialogImage = projectDialog.querySelector('.dialog-image');
function showProjectImage(index) {
  activeImage = (index + projectImages.length) % projectImages.length;
  const image = projectImages[activeImage];
  dialogImage.src = image.getAttribute('src'); dialogImage.alt = image.alt;
  projectDialog.querySelector('.gallery-position').textContent = `${activeImage + 1} / ${projectImages.length}`;
}
function renderProjectDialog() {
  const copy = openProject.querySelector('.project-copy').cloneNode(true);
  const heading = copy.querySelector('h2'); heading.id = 'project-dialog-title';
  copy.querySelector('.details-button')?.remove();
  projectDialog.querySelector('.dialog-description').replaceChildren(copy);
  projectImages = [...openProject.querySelectorAll('.project-gallery img')];
  projectDialog.querySelector('.dialog-gallery').hidden = !projectImages.length;
  projectDialog.querySelector('.dialog-body').classList.toggle('without-gallery', !projectImages.length);
  projectDialog.querySelector('.dialog-controls').hidden = projectImages.length < 2;
  projectDialog.querySelector('.dialog-close').setAttribute('aria-label', isEnglish() ? 'Close details' : 'Fechar detalhes');
  projectDialog.querySelector('.gallery-prev').setAttribute('aria-label', isEnglish() ? 'Previous image' : 'Imagem anterior');
  projectDialog.querySelector('.gallery-next').setAttribute('aria-label', isEnglish() ? 'Next image' : 'Próxima imagem');
  if (projectImages.length) showProjectImage(activeImage);
}
function openProjectDetails(project, index = 0) {
  openProject = project; activeImage = index;
  renderProjectDialog();
  previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  projectDialog.showModal();
  projectDialog.querySelector('.dialog-close').focus();
}
projectItems.forEach(project => {
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'details-button';
  button.dataset.pt = 'Explorar projeto ↗'; button.dataset.en = 'Explore project ↗';
  button.textContent = button.dataset.pt;
  button.setAttribute('aria-haspopup', 'dialog');
  button.addEventListener('click', () => openProjectDetails(project));
  project.querySelector('.project-copy').append(button);
  project.querySelectorAll('.project-gallery a').forEach((link, index) => {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); openProjectDetails(project, index);
    });
  });
});
projectDialog.querySelector('.dialog-close').addEventListener('click', () => projectDialog.close());
projectDialog.addEventListener('click', event => { if (event.target === projectDialog) projectDialog.close(); });
projectDialog.addEventListener('close', () => { document.body.style.overflow = previousOverflow; });
projectDialog.querySelector('.gallery-prev').addEventListener('click', () => showProjectImage(activeImage - 1));
projectDialog.querySelector('.gallery-next').addEventListener('click', () => showProjectImage(activeImage + 1));
projectDialog.addEventListener('keydown', event => {
  if (!projectImages.length) return;
  if (event.key === 'ArrowLeft') { event.preventDefault(); showProjectImage(activeImage - 1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); showProjectImage(activeImage + 1); }
});
