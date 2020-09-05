import * as arc from '@architect/functions';
import type { APIGatewayResult as AGWResult } from '@architect/functions';
import type { APIGatewayEvent as AGWEvent } from 'aws-lambda';

import { pageSiteDate } from '../../pages/page-site-date';

export const handler = async (req: AGWEvent): Promise<AGWResult> => {
  const { site, date } = req.pathParameters;
  const { owner } = await arc.http.session.read<{ owner: string }>(req);
  const body = await pageSiteDate(site, owner, date);

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
