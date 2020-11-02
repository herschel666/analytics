import * as arc from '@architect/functions';
import type {
  SubsequentAsyncHandlerEvent as AGWEvent,
  APIGatewayResult as AGWResult,
} from '@architect/functions';

import { withOwner } from '../../middlewares/with-owner';
import { siteExists } from '../../middlewares/site-exists';
import { handler as routeHandler } from '../../route-handlers/get-i-site-000site-referrers';

// TODO: enable selecting per month (like on devices page)
export const servePageSiteReferrers = async (
  req: AGWEvent
): Promise<AGWResult> => {
  const { site } = req.pathParameters;
  const { owner } = req.session;
  const data = await arc.tables();

  return routeHandler({
    data,
    site,
    owner,
  });
};

export const handler = arc.http.async(
  withOwner,
  siteExists,
  servePageSiteReferrers
);
