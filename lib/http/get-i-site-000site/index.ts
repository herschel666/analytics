import * as arc from '@architect/functions';
import type {
  SubsequentAsyncHandlerEvent as AGWEvent,
  APIGatewayResult as AGWResult,
} from '@architect/functions';

import { withOwner } from '../../shared/with-owner';
import { handler as routeHandler } from '../../route-handlers/get-i-site-000site';

export const servePageSite = async (req: AGWEvent): Promise<AGWResult> => {
  const { site } = req.pathParameters;
  const { from, to, cursor } = req.queryStringParameters || {};
  const { owner } = req.session;
  const data = await arc.tables();

  return routeHandler({
    data,
    owner,
    site,
    from,
    to,
    cursor,
  });
};

export const handler = arc.http.async(withOwner, servePageSite);
