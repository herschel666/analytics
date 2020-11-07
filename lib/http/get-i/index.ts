import * as arc from '@architect/functions';
import type {
  SubsequentAsyncHandlerEvent as AGWEvent,
  APIGatewayResult as AGWResult,
} from '@architect/functions';

import { withOwner } from '../../middlewares/with-owner';
import { forbiddenHtml } from '../../middlewares/with-owner/responses/html';
import { handler as routeHandler } from '../../route-handlers/get-i';

export const servePage = async (req: AGWEvent): Promise<AGWResult> => {
  const { debug } = req.queryStringParameters || {};
  const { owner } = req.session;
  const data = await arc.tables();

  return routeHandler({ data, owner, debug });
};

export const handler = arc.http.async(withOwner(forbiddenHtml), servePage);
