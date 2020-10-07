import * as arc from '@architect/functions';
import type {
  SubsequentAsyncHandlerEvent as AGWEvent,
  APIGatewayResult as AGWResult,
} from '@architect/functions';

import { withOwner } from '../../shared/with-owner';
import { pageUserSiteSettings } from '../../pages/page-user-site-settings';

export const servePageUserSiteSettings = async (
  req: AGWEvent
): Promise<AGWResult> => {
  const { site } = req.pathParameters;
  const { owner } = req.session;
  const body = await pageUserSiteSettings(site, owner);

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

export const handler = arc.http.async(withOwner, servePageUserSiteSettings);
