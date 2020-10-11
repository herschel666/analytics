import * as arc from '@architect/functions';
import type {
  SubsequentAsyncHandlerEvent as AGWEvent,
  APIGatewayResult as AGWResult,
} from '@architect/functions';

import { withOwner } from '../../shared/with-owner';
import { handler as routeHandler } from '../../route-handlers/get-user-site-000site-referrers';

export const servePageUserSiteReferrers = async (
  req: AGWEvent
): Promise<AGWResult> => {
  const { site } = req.pathParameters;
  const { owner } = req.session;

  return routeHandler({
    site,
    owner,
  });
};

export const handler = arc.http.async(withOwner, servePageUserSiteReferrers);
