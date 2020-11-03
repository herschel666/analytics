import type { Data, APIGatewayResult as AGWResult } from '@architect/functions';

import { getReferrersBySiteAndHost } from '../shared/ddb';
import { siteNameToHostname, isValidDate } from '../shared/util';
import { pageNotFound } from '../pages/page-not-found';
import { pageSiteReferrersHost } from '../pages/page-i-site-referrers-host';

interface Args {
  data: Data;
  site: string;
  date: string;
  host: string;
  owner: string;
}

export const handler = async ({
  data,
  site,
  date,
  host,
  owner,
}: Args): Promise<AGWResult> => {
  if (!isValidDate(`${date}-01`)) {
    return {
      headers: {
        'content-type': 'text/html; charset=utf8',
        'cache-control':
          'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
      },
      statusCode: 404,
      body: pageNotFound(),
    };
  }

  const referrerHostname = siteNameToHostname(host);
  const referrers = await getReferrersBySiteAndHost(
    data.analytics,
    site,
    date,
    owner,
    referrerHostname
  );
  const body = pageSiteReferrersHost({
    referrerHostname,
    referrers,
    site,
  });

  return {
    headers: {
      'content-type': 'text/html; charset=utf8',
      'cache-control':
        'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
    },
    statusCode: 200,
    body,
  };
};
