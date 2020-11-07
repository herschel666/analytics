import * as arc from '@architect/functions';
import type {
  SubsequentAsyncHandlerEvent as AGWEvent,
  APIGatewayResult as AGWResult,
} from '@architect/functions';

import { withOwner } from '../../middlewares/with-owner';
import { handler as routeHandler } from '../../route-handlers/get-api-sites';

export const serveApiSites = async (req: AGWEvent): Promise<AGWResult> => {
  const { owner } = req.session;
  const data = await arc.tables();

  return routeHandler({ data, owner });
};

export const handler = arc.http.async(withOwner, serveApiSites);
