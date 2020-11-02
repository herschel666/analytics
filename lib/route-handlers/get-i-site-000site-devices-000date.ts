import type { Data, APIGatewayResult as AGWResult } from '@architect/functions';

import { getUserAgentEntriesBySiteAndDate } from '../shared/ddb';
import { isValidDate } from '../shared/util';
import { pageNotFound } from '../pages/page-not-found';
import { pageSiteDevicesDate } from '../pages/page-i-site-devices-date';

interface Args {
  data: Data;
  site: string;
  date: string;
  owner: string;
}

export const handler = async ({
  data,
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
      statusCode: 400,
      body: pageNotFound({ message: 'Wrong URL-parameter.' }),
    };
  }

  const devices = await getUserAgentEntriesBySiteAndDate(
    data.analytics,
    site,
    owner,
    date
  );
  const body = pageSiteDevicesDate({ devices, site, date });

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
