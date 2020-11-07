import * as Turbolinks from 'turbolinks';

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

  if (lineChart && lineChart instanceof HTMLCanvasElement) {
    import('./modules/line-chart').then(({ init }) => init(lineChart, visit));
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
    import('./modules/sites-selector').then(({ init }) => init(sitesSelector));
  }

  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-toggle="tooltip"]')
  );
  tooltipTriggerList.map(
    (tooltipTriggerEl) => new window.bootstrap.Tooltip(tooltipTriggerEl)
  );
};

document.addEventListener('turbolinks:load', initSite);
Turbolinks.start();
