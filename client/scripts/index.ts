const dateInputs = document.querySelectorAll('input[type="date"');
const lineChart = document.getElementById('line-chart');
const pieCharts = Array.from(
  document.querySelectorAll<HTMLCanvasElement>('canvas.js-pie-chart')
);
const deleteSiteButton = document.getElementById('delete-site');

if (dateInputs.length) {
  import('./modules/date-input-polyfill').then(({ init }) => init());
}

if (lineChart && lineChart instanceof HTMLCanvasElement) {
  import('./modules/line-chart').then(({ init }) => init(lineChart));
}

if (pieCharts.length) {
  import('./modules/pie-chart').then(({ init }) =>
    pieCharts.forEach((e) => init(e))
  );
}

if (deleteSiteButton && deleteSiteButton instanceof HTMLButtonElement) {
  import('./modules/delete-site').then(({ init }) => init(deleteSiteButton));
}
