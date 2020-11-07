import * as arc from '@architect/functions';
import type {
  SubsequentAsyncHandlerEvent as AGWEvent,
  APIGatewayResult as AGWResult,
} from '@architect/functions';

import { withOwner } from '../../middlewares/with-owner';
import { forbiddenHtml } from '../../middlewares/with-owner/responses/html';
import { siteExists } from '../../middlewares/site-exists';
import { handler as routeHandler } from '../../route-handlers/get-i-site-000site-date-000date';

export const servePageSiteDate = async (req: AGWEvent): Promise<AGWResult> => {
  const { site, date } = req.pathParameters;
  const { range } = req.queryStringParameters || { range: '' };
  const { owner } = req.session;
  const data = await arc.tables();

  return routeHandler({ data, owner, site, date, range });
};

export const handler = arc.http.async(
  withOwner(forbiddenHtml),
  siteExists,
  servePageSiteDate
);
