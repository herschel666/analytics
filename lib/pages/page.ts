const html = String.raw;

export const page = (body: string, title = 'ek|analytics'): string =>
  html`
    <!DOCTYPE html>
    <html lang="en-EN">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <link
          rel="stylesheet"
          href="https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha2/css/bootstrap.min.css"
          integrity="sha384-DhY6onE6f3zzKbjUPRc2hOzGAdEf4/Dz+WJwBvEYL/lkkIsI3ihufq9hk9K4lVoK"
          crossorigin="anonymous"
        />
        <link href="/_static/styles/main.css" rel="stylesheet" />
      </head>
      <body class="min-vh-100">
        ${body}
        <script
          src="https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha2/js/bootstrap.bundle.min.js"
          integrity="sha384-BOsAfwzjNJHrJ8cZidOg56tcQWfp6y72vEJ8xQ9w6Quywb24iOsW913URv1IS4GD"
          crossorigin="anonymous"
        ></script>
        <script src="/_static/scripts/index.js"></script>
      </body>
    </html>
  `.trim();
