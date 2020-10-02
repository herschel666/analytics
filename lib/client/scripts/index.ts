const dateInputs = document.querySelectorAll('input[type="date"');

if (dateInputs.length) {
  import('./modules/date-input-polyfill').then(({ init }) => init());
}
