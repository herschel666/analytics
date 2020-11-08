import type { PrefetchPages } from './prefetch-pages';

const html = String.raw;

const siteNameToHostname = (site: string): string => site.replace(/_+/g, '.');

const createMenuItem = (site: string): string => html`
  <span>
    <a class="dropdown-item" href="/i/site/${site}">
      ${siteNameToHostname(site)}
    </a>
  </span>
`;

export const init = async (
  nav: HTMLElement,
  prefetchPages: PrefetchPages
): Promise<void> => {
  const menu = nav.querySelector('.js-dropdown-menu');

  if (!(menu instanceof HTMLDivElement)) {
    console.warn(
      'Site navigation without <div class="dropdown-menu /> on page.'
    );
    return;
  }

  const menuItems = menu.getElementsByTagName('span');

  if (menuItems.length > 0) {
    return;
  }

  const response = await fetch('/api/sites');
  const sites = await response.json();

  menu.innerHTML = sites.map(createMenuItem).join('');
  prefetchPages(Array.from(menu.querySelectorAll('a')));
  nav.classList.remove('invisible');
};
