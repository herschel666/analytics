import * as arc from '@architect/functions';
import type {
  SubsequentAsyncHandlerEvent as AGWEvent,
  APIGatewayResult as AGWResult,
} from '@architect/functions';

import { handler as routeHandler } from '../../route-handlers/get-index';

export const handler = async (req: AGWEvent): Promise<AGWResult> => {
  const { owner } = await arc.http.session.read<{ owner?: string }>(req);
  const { code } = req.queryStringParameters || {};

  return routeHandler({ owner, code, write: arc.http.session.write });
};
