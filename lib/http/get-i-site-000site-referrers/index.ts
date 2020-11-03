import * as arc from '@architect/functions';
import type {
  SubsequentAsyncHandlerEvent as AGWEvent,
  APIGatewayResult as AGWResult,
} from '@architect/functions';

import { siteExists } from '../../middlewares/site-exists';
import { handler as routeHandler } from '../../route-handlers/get-i-site-000site-xxx';

export const servePageSiteDevices = async (
  req: AGWEvent
): Promise<AGWResult> => {
  const { site } = req.pathParameters;

  return routeHandler({ site, type: 'referrers' });
};

export const handler = arc.http.async(siteExists, servePageSiteDevices);
