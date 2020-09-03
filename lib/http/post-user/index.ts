import * as arc from '@architect/functions';

import { hostnameToSite } from '../../shared/util';
import { addSite } from '../../shared/ddb';
import { pageIndex } from '../../pages/page-index';

interface Params {
  debug?: string;
}

interface Req {
  queryStringParameters: Params | null;
  headers: Record<string, string>;
}
interface Payload {
  site_url?: unknown;
}

export const handler = async (req: Req) => {
  const { owner } = await arc.http.session.read<Req, { owner: string }>(req);
  const { debug: debugParam } = req.queryStringParameters || {};
  const debug = debugParam === 'true' && process.env.NODE_ENV === 'testing';
  const { site_url } = arc.http.helpers.bodyParser<Req, Payload>(req);
  const siteUrl = site_url && String(site_url);

  if (siteUrl) {
    const { hostname } = new URL(siteUrl);
    const doc = await arc.tables();

    await addSite(doc.analytics, hostnameToSite(hostname), owner);
  }

  return await pageIndex(owner, debug);
};
