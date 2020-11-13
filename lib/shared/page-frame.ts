import * as arc from '@architect/functions';

const html = String.raw;

export const pageFrame = (body: string, title = 'ek|analytics'): string =>
  html`
    <!DOCTYPE html>
    <html lang="en-EN">
      <head>
        <meta charset="utf-8" />
        <meta name="robots" content="noindex,noarchive" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="generator" content="FrontPage 4.0" />
        <meta name="theme-color" content="#f8f9fa" />
        <meta name="turbolinks-cache-control" content="no-cache" />
        <meta name="turbolinks-root" content="/i" />
        <title>${title}</title>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-alpha3/dist/css/bootstrap.min.css"
          integrity="sha384-CuOF+2SnTUfTwSZjCXf01h7uYhfOBuxIhGKPbfEJ3+FqH/s6cIFN9bGr1HmAg4fQ"
          crossorigin="anonymous"
        />
        <link
          href="${arc.http.helpers.static('styles/main.css')}"
          rel="stylesheet"
        />
        <link href="/favicon.ico" rel="shortcut icon" />
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-alpha3/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-popRpmFF9JQgExhfw5tZT4I9/CI5e2QcuUZPOVXb1m7qUmeR2b50u+YFEYe1wgzy"
          crossorigin="anonymous"
          defer
        ></script>
        <script
          src="${arc.http.helpers.static('scripts/index.js')}"
          defer
        ></script>
      </head>
      <body class="min-vh-100">
        ${body}
      </body>
    </html>
  `.trim();
