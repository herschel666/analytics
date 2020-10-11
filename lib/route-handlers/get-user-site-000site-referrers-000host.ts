import type { APIGatewayResult as AGWResult } from '@architect/functions';

import { siteNameToHostname } from '../shared/util';
import { pageUserSiteReferrersHost } from '../pages/page-user-site-referrers-host';

interface Args {
  site: string;
  host: string;
  owner: string;
}

export const handler = async ({
  site,
  host,
  owner,
}: Args): Promise<AGWResult> => {
  const body = await pageUserSiteReferrersHost(
    site,
    owner,
    siteNameToHostname(host)
  );

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
