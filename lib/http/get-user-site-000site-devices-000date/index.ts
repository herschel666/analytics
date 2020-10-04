import * as arc from '@architect/functions';
import type {
  SubsequentAsyncHandlerEvent as AGWEvent,
  APIGatewayResult as AGWResult,
} from '@architect/functions';

import { withOwner } from '../../shared/with-owner';
import { pageUserSiteDevicesDate } from '../../pages/page-user-site-devices-date';

const servePageUserSiteDevicesDate = async (
  req: AGWEvent
): Promise<AGWResult> => {
  const { site, date } = req.pathParameters;

  if (!Boolean(date.match(/^\d{4}-\d{2}$/))) {
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

  const { owner } = await arc.http.session.read<{ owner: string }>(req);
  const body = await pageUserSiteDevicesDate(site, owner, date);

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

export const handler = arc.http.async(withOwner, servePageUserSiteDevicesDate);
