import * as arc from '@architect/functions';
import type {
  SubsequentAsyncHandlerEvent as AGWEvent,
  APIGatewayResult as AGWResult,
} from '@architect/functions';

import { withOwner } from '../../middlewares/with-owner';
import { siteExists } from '../../middlewares/site-exists';
import { handler as routeHandler } from '../../route-handlers/post-i-site-000site-settings';

export const servePage = async (req: AGWEvent): Promise<AGWResult> => {
  const { site } = req.pathParameters;
  const { owner } = req.session;
  const data = await arc.tables();

  return routeHandler({
    queues: arc.queues,
    data,
    site,
    owner,
  });
};

export const handler = arc.http.async(withOwner, siteExists, servePage);
