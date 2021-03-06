import * as arc from '@architect/functions';
import type {
  SubsequentAsyncHandlerEvent as AGWEvent,
  APIGatewayResult as AGWResult,
} from '@architect/functions';

import { withOwner } from '../../middlewares/with-owner';
import { forbiddenHtml } from '../../middlewares/with-owner/responses/html';
import { siteExists } from '../../middlewares/site-exists';
import { handler as routeHandler } from '../../route-handlers/get-i-site-000site-referrers-000date-000host';

export const servePageSiteReferrersDateHost = async (
  req: AGWEvent
): Promise<AGWResult> => {
  const { site, date, host } = req.pathParameters;
  const { owner } = req.session;
  const data = await arc.tables();

  return routeHandler({ data, site, host, date, owner });
};

export const handler = arc.http.async(
  withOwner(forbiddenHtml),
  siteExists,
  servePageSiteReferrersDateHost
);
