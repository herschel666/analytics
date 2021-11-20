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
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
          integrity="sha256-YvdLHPgkqJ8DVUxjjnGVlMMJtNimJ6dYkowFFvp4kKs="
          crossorigin="anonymous"
        />
        <style>
          .cursor-pointer {
            cursor: pointer;
          }
        </style>
        <link href="/favicon.ico" rel="shortcut icon" />
        <script
          src="https://unpkg.com/@popperjs/core@2.10.2/dist/umd/popper.min.js"
          defer
        ></script>
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.min.js"
          integrity="sha256-cMPWkL3FzjuaFSfEYESYmjF25hCIL6mfRSPnW8OVvM4="
          crossorigin="anonymous"
          defer
        ></script>
        <script src="${arc.http.helpers.static('index.js')}" defer></script>
      </head>
      <body class="min-vh-100">
        ${body}
      </body>
    </html>
  `.trim();
