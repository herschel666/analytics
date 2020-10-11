import * as arc from '@architect/functions';
import type {
  SubsequentAsyncHandlerEvent as AGWEvent,
  APIGatewayResult as AGWResult,
} from '@architect/functions';

import { withOwner } from '../../shared/with-owner';
import { handler as routeHandler } from '../../route-handlers/get-user-site-000site';

export const servePageUserSite = async (req: AGWEvent): Promise<AGWResult> => {
  const { site } = req.pathParameters;
  const { from, to, cursor } = req.queryStringParameters || {};
  const { owner } = req.session;

  return routeHandler({
    owner,
    site,
    from,
    to,
    cursor,
  });
};

export const handler = arc.http.async(withOwner, servePageUserSite);
