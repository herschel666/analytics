import { join } from 'path';
import { readFileSync as readFile } from 'fs';

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
    <link href="/_static/main.css" rel="stylesheet">
    ${insertCSS()}
  </head>
  <body>
    ${body}
    <script src="/_static/index.js"></script>
  </body>
</html>
`.trim();
