const menuButton = document.querySelector('.menu_button');
const navigation = document.querySelector('#main_navigation');
const hero = document.querySelector('.hero');
const scrollingSectionHeadings = [...document.querySelectorAll('.section_scroll_heading')];

if ((hero || scrollingSectionHeadings.length) && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let scrollUpdatePending = false;

  const updateScrollingTitles = () => {
    if (hero) {
      const fadeDistance = Math.max(hero.offsetHeight * 0.55, 240);
      const progress = Math.min(Math.max(window.scrollY / fadeDistance, 0), 1);
      hero.style.setProperty('--hero-title-progress', progress.toFixed(3));
    }

    scrollingSectionHeadings.forEach((heading) => {
      const visual = heading.closest('.section_visual');
      const visualRect = visual.getBoundingClientRect();
      const fadeDistance = Math.max(visualRect.height * 0.55, 240);
      const progress = Math.min(Math.max((varHeaderHeight() - visualRect.top) / fadeDistance, 0), 1);
      heading.style.setProperty('--section-title-progress', progress.toFixed(3));
    });

    scrollUpdatePending = false;
  };

  const varHeaderHeight = () => {
    const value = getComputedStyle(document.documentElement).getPropertyValue('--header-height');
    return Number.parseFloat(value) * Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  };

  const requestHeroTitleUpdate = () => {
    if (scrollUpdatePending) return;
    scrollUpdatePending = true;
    window.requestAnimationFrame(updateScrollingTitles);
  };

  updateScrollingTitles();
  window.addEventListener('scroll', requestHeroTitleUpdate, { passive: true });
  window.addEventListener('resize', requestHeroTitleUpdate);
}

function closeMenu({ returnFocus = false } = {}) {
  if (!menuButton || !navigation) return;
  menuButton.setAttribute('aria-expanded', 'false');
  navigation.dataset.open = 'false';
  document.body.classList.remove('menu_open');
  if (returnFocus) menuButton.focus();
}

if (menuButton && navigation) {
  menuButton.addEventListener('click', () => {
    const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(willOpen));
    navigation.dataset.open = String(willOpen);
    document.body.classList.toggle('menu_open', willOpen);
  });

  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      closeMenu({ returnFocus: true });
    }
  });

  window.addEventListener('resize', () => {
    if (window.matchMedia('(min-width: 44.01rem)').matches) closeMenu();
  });
}

const navigationLinks = [...document.querySelectorAll('.navbar_links a[href^="#"]')];
const observedSections = navigationLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window && observedSections.length) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const visibleEntry = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visibleEntry) return;

    navigationLinks.forEach((link) => {
      const isCurrent = link.getAttribute('href') === `#${visibleEntry.target.id}`;
      if (isCurrent) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, {
    rootMargin: '-25% 0px -55% 0px',
    threshold: [0, 0.2, 0.5]
  });

  observedSections.forEach((section) => sectionObserver.observe(section));
}

document.querySelectorAll('[data-current-year]').forEach((element) => {
  element.textContent = new Date().getFullYear();
});
