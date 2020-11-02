import * as arc from '@architect/functions';
import type {
  SubsequentAsyncHandlerEvent as AGWEvent,
  APIGatewayResult as AGWResult,
} from '@architect/functions';

import { withOwner } from '../../middlewares/with-owner';
import { siteExists } from '../../middlewares/site-exists';
import { handler as routeHandler } from '../../route-handlers/get-i-site-000site-devices-000date';

export const servePageSiteDevicesDate = async (
  req: AGWEvent
): Promise<AGWResult> => {
  const { site, date } = req.pathParameters;
  const { owner } = req.session;
  const data = await arc.tables();

  return routeHandler({ data, site, date, owner });
};

export const handler = arc.http.async(
  withOwner,
  siteExists,
  servePageSiteDevicesDate
);
