const noInputDateSupport =
  Object.assign(document.createElement('input'), {
    type: 'date',
    value: '_',
  }).value === '_';

const load = (src) =>
  new Promise((resolve) =>
    document.head.appendChild(
      Object.assign(document.createElement('script'), {
        src,
        onload: resolve,
      })
    )
  );

export const init = (): void => {
  if (noInputDateSupport) {
    [
      'https://unpkg.com/better-dom@^4/dist/better-dom.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/better-dateinput-polyfill/3.3.0/better-dateinput-polyfill.min.js',
    ].reduce((p, src) => p.then(() => load(src)), Promise.resolve());
  }
};
