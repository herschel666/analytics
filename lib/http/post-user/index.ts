import * as arc from '@architect/functions';
import type {
  SubsequentAsyncHandlerEvent as AGWEvent,
  APIGatewayResult as AGWResult,
} from '@architect/functions';

import { withOwner } from '../../shared/with-owner';
import { handler as routeHandler } from '../../route-handlers/post-user';

interface Payload {
  site_url?: unknown;
}

export const servePageUser = async (req: AGWEvent): Promise<AGWResult> => {
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

export const handler = arc.http.async(withOwner, servePageUser);
