import * as Turbolinks from 'turbolinks';

import {
  prefetchPages,
  clearPrefetchListeners,
  prefetchSinglePage,
} from './modules/prefetch-pages';

const initSite = (): void => {
  const visit = (uri: string): void => Turbolinks.visit(uri);

  const dateInputs = document.querySelectorAll('input[type="date"');
  const lineChart = document.getElementById('line-chart');
  const pieCharts = Array.from(
    document.querySelectorAll<HTMLCanvasElement>('canvas.js-pie-chart')
  );
  const deleteSiteButton = document.getElementById('delete-site');
  const formPageViewsDateRange = document.getElementById(
    'form-page-views-date-range'
  );
  const sitesSelector = document.getElementById('sites-selector');

  if (dateInputs.length) {
    import('./modules/date-input-polyfill').then(({ init }) => init());
  }

  if (lineChart instanceof HTMLCanvasElement) {
    import('./modules/line-chart').then(({ init }) =>
      init(lineChart, prefetchSinglePage, visit)
    );
  }

  if (pieCharts.length) {
    import('./modules/pie-chart').then(({ init }) =>
      pieCharts.forEach((e) => init(e))
    );
  }

  if (deleteSiteButton instanceof HTMLButtonElement) {
    import('./modules/delete-site').then(({ init }) => init(deleteSiteButton));
  }

  if (formPageViewsDateRange instanceof HTMLFormElement) {
    import('./modules/form-page-views-date-range').then(({ init }) =>
      init(formPageViewsDateRange, visit)
    );
  }

  if (sitesSelector instanceof HTMLElement) {
    import('./modules/sites-selector').then(({ init }) =>
      init(sitesSelector, prefetchPages)
    );
  }

  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  tooltipTriggerList.map(
    (tooltipTriggerEl) =>
      new window.bootstrap.Tooltip(tooltipTriggerEl, {
        container: 'body',
      })
  );

  const internalPages = Array.from(document.links).filter(
    ({ hostname }) => hostname === location.hostname
  );
  prefetchPages(internalPages);
};

const cleanPage = (): void => {
  clearPrefetchListeners();
};

document.addEventListener('turbolinks:load', initSite);
document.addEventListener('turbolinks:click', cleanPage);
Turbolinks.start();
