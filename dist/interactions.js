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
