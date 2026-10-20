const toggle=document.querySelector('#language');let language='pt';toggle.addEventListener('click',()=>{language=language==='pt'?'en':'pt';document.documentElement.lang=language==='pt'?'pt-BR':'en';document.querySelectorAll('[data-pt]').forEach(el=>el.innerHTML=el.dataset[language]);toggle.textContent=language==='pt'?'EN':'PT';toggle.setAttribute('aria-label',language==='pt'?'Switch to English':'Mudar para português');});document.querySelector('#year').textContent=new Date().getFullYear();

// Progressive enhancement: content remains visible without animation support.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const reveals = new Map();
const revealTargets = document.querySelectorAll('.hero > .eyebrow, .hero h1, .hero-bottom, .section-heading, .project-gallery, .project-copy, .about-grid > *, .credentials > *, .contact-copy, .contact-portrait');
let revealObserver;
function finishReveals() {
  revealObserver?.disconnect();
  reveals.forEach(animation => animation.finish());
  reveals.clear();
}
if (!motionPreference.matches && 'IntersectionObserver' in window && 'animate' in Element.prototype) {
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      reveals.get(entry.target)?.play();
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
  revealTargets.forEach((element, index) => {
    // Deep links and already-visible sections appear immediately.
    const bounds = element.getBoundingClientRect();
    if (location.hash || bounds.bottom <= 0) return;
    const animation = element.animate([
      { opacity: 0, transform: 'translateY(22px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 650, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both', delay: index < 3 ? index * 85 : 0 });
    animation.pause();
    reveals.set(element, animation);
    animation.onfinish = () => { animation.cancel(); reveals.delete(element); };
    revealObserver.observe(element);
  });
  // Keep keyboard navigation immediately visible, even before scroll observation.
  document.addEventListener('focusin', event => {
    reveals.forEach((animation, element) => {
      if (element.contains(event.target)) animation.finish();
    });
  });
  window.addEventListener('hashchange', finishReveals);
  window.addEventListener('pageshow', event => { if (event.persisted) finishReveals(); });
}
motionPreference.addEventListener('change', event => {
  if (event.matches) finishReveals();
});
