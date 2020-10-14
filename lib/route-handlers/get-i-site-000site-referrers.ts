import type { Data, APIGatewayResult as AGWResult } from '@architect/functions';

import { getReferrersBySite } from '../shared/ddb';
import { pageSiteReferrers } from '../pages/page-i-site-referrers';

interface Args {
  data: Data;
  site: string;
  owner: string;
}

export const handler = async ({
  data,
  site,
  owner,
}: Args): Promise<AGWResult> => {
  const referrers = await getReferrersBySite(data.analytics, site, owner);
  const body = pageSiteReferrers({ referrers, site });

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
