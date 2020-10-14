import type { Data, APIGatewayResult as AGWResult } from '@architect/functions';

import { getSite } from '../shared/ddb';
import { pageSiteSettings } from '../pages/page-i-site-settings';

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
  const { hash: id } = await getSite(data.analytics, site, owner);
  const body = pageSiteSettings({ site, id });

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
