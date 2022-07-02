@app
analytics

@aws
region eu-central-1
runtime nodejs16.x
profile ek-analytics
bucket ek-geloets-installationen-ftw

@static
folder dist

@http
get /
get /i
get /i/site/:site
get /i/site/:site/settings
get /i/site/:site/referrers
get /i/site/:site/referrers/:date
get /i/site/:site/referrers/:date/:host
get /i/site/:site/devices
get /i/site/:site/devices/:date
get /i/site/:site/date/:date
get /cctv.gif
post /i
post /i/site/:site/settings
post /logout
get /favicon.ico

get /api/sites

get /test/some-page
get /test/other-page
get /test/populate

get /*

@tables
analytics
  PK *String
  SK **String

@indexes
analytics
  GSI1PK *String
  GSI1SK **String

@queues
delegate-site-deletion
delete-site-entry
track-page-view

@macros
custom-domain
herschel666-arc-macros-remove-local-routes
herschel666-arc-macros-custom-log-groups
cloudwatch-dashboard

@herschel666-arc-macros-remove-local-routes
/test/some-page
/test/other-page
/test/populate
