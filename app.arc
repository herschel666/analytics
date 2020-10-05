@app
analytics

@aws
region eu-central-1
bucket ek-geloets-installationen-ftw

@static
folder dist

@http
get /
# TODO: rename /user to /i
get /user
get /user/site/:site
get /user/site/:site/settings
get /user/site/:site/referrers
get /user/site/:site/referrers/:host
get /user/site/:site/devices
get /user/site/:site/devices/:date
get /user/site/:site/date/:date
get /cctv.gif
post /user

get /test/some-page
get /test/other-page
get /test/populate

# TODO: add TTL for site & account deletion
@tables
analytics
  PK *String
  SK **String

@indexes
analytics
  GSI1PK *String
  GSI1SK **String
