@app
analytics

@aws
region eu-central-1
bucket ek-geloets-installationen-ftw

@http
get /
get /user
get /user/site/:site
get /user/site/:site/settings
get /user/site/:site/referrers
get /user/site/:site/referrers/:host
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

@indexes
analytics
  GSI1PK *String
  GSI1SK **String
