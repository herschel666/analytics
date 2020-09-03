@app
analytics

@aws
region eu-central-1
bucket ek-geloets-installationen-ftw

@http
get /
get /user
get /user/site/:site
get /user/site/:site/date/:date
get /cctv.gif
post /user

get /test/some-page
get /test/other-page
get /test/populate

@tables
analytics
  PK *String
  SK **String
