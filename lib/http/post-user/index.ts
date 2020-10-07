import * as arc from '@architect/functions';
import type {
  SubsequentAsyncHandlerEvent as AGWEvent,
  APIGatewayResult as AGWResult,
} from '@architect/functions';

import { withOwner } from '../../shared/with-owner';
import { hostnameToSite } from '../../shared/util';
import { addSite } from '../../shared/ddb';
import { pageUser } from '../../pages/page-user';

interface Payload {
  site_url?: unknown;
}

export const servePageUser = async (req: AGWEvent): Promise<AGWResult> => {
  const { owner } = req.session;
  const { debug: debugParam } = req.queryStringParameters || {};
  const debug =
    typeof debugParam === 'string' && process.env.NODE_ENV === 'testing'
      ? debugParam.split(',')
      : undefined;
  const { site_url } = arc.http.helpers.bodyParser<Payload>(req);
  const siteUrl = site_url && String(site_url);

  if (siteUrl) {
    const { hostname } = new URL(siteUrl);
    const doc = await arc.tables();

    await addSite(doc.analytics, hostnameToSite(hostname), owner);
  }

  const body = await pageUser(owner, debug);

  return {
    headers: {
      'content-type': 'text/html; charset=utf8',
      'cache-control':
        'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
    },
    statusCode: 200,
    body,
  };
};

export const handler = arc.http.async(withOwner, servePageUser);
