import type { APIGatewayResult as AGWResult } from '@architect/functions';

import { pageSiteReferrers } from '../pages/page-i-site-referrers';

interface Args {
  site: string;
  owner: string;
}

export const handler = async ({ site, owner }: Args): Promise<AGWResult> => {
  const body = await pageSiteReferrers(site, owner);

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
