import { join } from 'path';
import { readFileSync as readFile } from 'fs';
import './page.css';

const insertCSS = (): string => {
  try {
    return `<style>${readFile(join(__dirname, 'index.css'), 'utf8')}</style>`;
  } catch {
    return '';
  }
};

export const page = (body: string, title = 'ek|analytics'): string =>
  /* html */ `
<!doctype html>
<html lang="en-EN">
  <head>
    <meta charset="utf-8">
    <title>${title}</title>
    <link href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css" rel="stylesheet">
    ${insertCSS()}
  </head>
  <body>
    ${body}
    <script>
      const noInputDateSupport =
        Object.assign(document.createElement('input'), {
          type: 'date',
          value: '_',
        }).value === '_';
      if (
        noInputDateSupport &&
        document.querySelectorAll('input[type="date"').length
      ) {
        const load = (src) =>
          new Promise((resolve) =>
            document.head.appendChild(
              Object.assign(document.createElement('script'), {
                src,
                onload: resolve,
              })
            )
          );
        [
          'https://unpkg.com/better-dom@^4/dist/better-dom.min.js',
          'https://cdnjs.cloudflare.com/ajax/libs/better-dateinput-polyfill/3.3.0/better-dateinput-polyfill.min.js',
        ].reduce((p, src) => p.then(() => load(src)), Promise.resolve());
      }
    </script>
  </body>
</html>
`.trim();
