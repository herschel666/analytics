import type { Data, APIGatewayResult as AGWResult } from '@architect/functions';

import { getReferrersBySiteAndHost } from '../shared/ddb';
import { siteNameToHostname } from '../shared/util';
import { pageSiteReferrersHost } from '../pages/page-i-site-referrers-host';

interface Args {
  data: Data;
  site: string;
  host: string;
  owner: string;
}

export const handler = async ({
  data,
  site,
  host,
  owner,
}: Args): Promise<AGWResult> => {
  const referrerHostname = siteNameToHostname(host);
  const referrers = await getReferrersBySiteAndHost(
    data.analytics,
    site,
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
