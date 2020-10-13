import type { APIGatewayResult as AGWResult } from '@architect/functions';

import { isValidDate } from '../shared/util';
import { pageSiteDevicesDate } from '../pages/page-i-site-devices-date';

interface Args {
  site: string;
  date: string;
  owner: string;
}

export const handler = async ({
  site,
  date,
  owner,
}: Args): Promise<AGWResult> => {
  if (!isValidDate(`${date}-01`)) {
    return {
      headers: {
        'content-type': 'text/plain; charset=utf8',
        'cache-control':
          'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
      },
      statusCode: 404,
      body: 'Wrong URL-parameter.',
    };
  }

  const body = await pageSiteDevicesDate(site, owner, date);

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
