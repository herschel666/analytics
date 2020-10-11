import * as arc from '@architect/functions';
import type {
  SubsequentAsyncHandlerEvent as AGWEvent,
  APIGatewayResult as AGWResult,
} from '@architect/functions';

import { withOwner } from '../../shared/with-owner';
import { handler as routeHandler } from '../../route-handlers/get-user-site-000site-date-000date';

export const servePageUserSiteDate = async (
  req: AGWEvent
): Promise<AGWResult> => {
  const { site, date } = req.pathParameters;
  const { range } = req.queryStringParameters || { range: '' };
  const { owner } = req.session;

  return routeHandler({ owner, site, date, range });
};

export const handler = arc.http.async(withOwner, servePageUserSiteDate);
