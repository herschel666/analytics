import type { Data, APIGatewayResult as AGWResult } from '@architect/functions';

import { getReferrersBySite } from '../shared/ddb';
import { isValidDate } from '../shared/util';
import { pageNotFound } from '../pages/page-not-found';
import { pageSiteReferrersDate } from '../pages/page-i-site-referrers-date';

interface Args {
  data: Data;
  site: string;
  owner: string;
  date: string;
}

export const handler = async ({
  data,
  site,
  owner,
  date,
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

  const referrers = await getReferrersBySite(data.analytics, site, owner, date);
  const body = pageSiteReferrersDate({ referrers, site });

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
