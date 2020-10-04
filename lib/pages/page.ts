export const page = (body: string, title = 'ek|analytics'): string =>
  /* html */ `
<!doctype html>
<html lang="en-EN">
  <head>
    <meta charset="utf-8">
    <title>${title}</title>
    <link href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css" rel="stylesheet">
    <link href="/_static/styles/main.css" rel="stylesheet">
  </head>
  <body>
    ${body}
    <script src="/_static/scripts/index.js"></script>
  </body>
</html>
`.trim();
