import * as arc from '@architect/functions';
import type {
  SubsequentAsyncHandlerEvent as AGWEvent,
  APIGatewayResult as AGWResult,
} from '@architect/functions';

import { handler as routeHandler } from '../../route-handlers/get-user-site-000site-devices-000date';
import { withOwner } from '../../shared/with-owner';

export const servePageUserSiteDevicesDate = async (
  req: AGWEvent
): Promise<AGWResult> => {
  const { site, date } = req.pathParameters;
  const { owner } = req.session;

  return routeHandler({ site, date, owner });
};

export const handler = arc.http.async(withOwner, servePageUserSiteDevicesDate);
