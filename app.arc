@app
analytics

@aws
region eu-central-1
bucket ek-geloets-installationen-ftw

@http
get /
get /site/:site
get /site/:site/date/:date
get /cctv.gif
post /

get /test/some-page
get /test/other-page
get /test/populate

@tables
analytics
  PK *String
  SK **String
