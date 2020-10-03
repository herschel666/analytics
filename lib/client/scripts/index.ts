const dateInputs = document.querySelectorAll('input[type="date"');
const lineChart = document.getElementById('line-chart');

if (dateInputs.length) {
  import('./modules/date-input-polyfill').then(({ init }) => init());
}

if (lineChart && lineChart instanceof HTMLCanvasElement) {
  import('./modules/line-chart').then(({ init }) => init(lineChart));
}
