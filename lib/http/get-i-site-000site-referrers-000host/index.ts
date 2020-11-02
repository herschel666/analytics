import * as arc from '@architect/functions';
import type {
  SubsequentAsyncHandlerEvent as AGWEvent,
  APIGatewayResult as AGWResult,
} from '@architect/functions';

import { withOwner } from '../../middlewares/with-owner';
import { handler as routeHandler } from '../../route-handlers/get-i-site-000site-referrers-000host';

export const servePageSiteReferrersHost = async (
  req: AGWEvent
): Promise<AGWResult> => {
  const { site, host } = req.pathParameters;
  const { owner } = req.session;
  const data = await arc.tables();

  return routeHandler({ data, site, host, owner });
};

export const handler = arc.http.async(withOwner, servePageSiteReferrersHost);
