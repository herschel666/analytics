import * as arc from '@architect/functions';
import type { APIGatewayResult as AGWResult } from '@architect/functions';
import type { APIGatewayEvent as AGWEvent } from 'aws-lambda';

import { hostnameToSite } from '../../shared/util';
import { addSite } from '../../shared/ddb';
import { pageIndex } from '../../pages/page-index';

interface Payload {
  site_url?: unknown;
}

export const handler = async (req: AGWEvent): Promise<AGWResult> => {
  const { owner } = await arc.http.session.read<{ owner: string }>(req);
  const { debug: debugParam } = req.queryStringParameters || {};
  const debug = debugParam === 'true' && process.env.NODE_ENV === 'testing';
  const { site_url } = arc.http.helpers.bodyParser<Payload>(req);
  const siteUrl = site_url && String(site_url);

  if (siteUrl) {
    const { hostname } = new URL(siteUrl);
    const doc = await arc.tables();

    await addSite(doc.analytics, hostnameToSite(hostname), owner);
  }

  const body = await pageIndex(owner, debug);

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
