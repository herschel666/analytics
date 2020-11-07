import * as arc from '@architect/functions';
import type {
  SubsequentAsyncHandlerEvent as AGWEvent,
  APIGatewayResult as AGWResult,
} from '@architect/functions';

import { withOwner } from '../../middlewares/with-owner';
import { forbiddenHtml } from '../../middlewares/with-owner/responses/html';
import { handler as routeHandler } from '../../route-handlers/post-i';

interface Payload {
  site_url?: unknown;
}

export const servePage = async (req: AGWEvent): Promise<AGWResult> => {
  const { owner } = req.session;
  const { debug } = req.queryStringParameters || {};
  const { site_url } = arc.http.helpers.bodyParser<Payload>(req);
  const siteUrl = site_url ? String(site_url) : undefined;
  const data = await arc.tables();

  return routeHandler({
    data,
    owner,
    siteUrl,
    debug,
  });
};

export const handler = arc.http.async(withOwner(forbiddenHtml), servePage);
