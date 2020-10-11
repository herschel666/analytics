import * as arc from '@architect/functions';
import type {
  SubsequentAsyncHandlerEvent as AGWEvent,
  APIGatewayResult as AGWResult,
} from '@architect/functions';

import { withOwner } from '../../shared/with-owner';
import { handler as routeHandler } from '../../route-handlers/get-user-site-000site-referrers-000host';

export const servePageUserSiteReferrersHost = async (
  req: AGWEvent
): Promise<AGWResult> => {
  const { site, host } = req.pathParameters;
  const { owner } = req.session;

  return routeHandler({ site, host, owner });
};

export const handler = arc.http.async(
  withOwner,
  servePageUserSiteReferrersHost
);
