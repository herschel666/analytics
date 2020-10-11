import * as arc from '@architect/functions';
import type {
  SubsequentAsyncHandlerEvent as AGWEvent,
  APIGatewayResult as AGWResult,
} from '@architect/functions';

import { withOwner } from '../../shared/with-owner';
import { handler as routeHandler } from '../../route-handlers/get-user';

export const servePageUser = async (req: AGWEvent): Promise<AGWResult> => {
  const { debug } = req.queryStringParameters || {};
  const { owner } = req.session;

  return routeHandler({ owner, debug });
};

export const handler = arc.http.async(withOwner, servePageUser);
