import * as arc from '@architect/functions';

import type { Request, Response } from '../../types/analytics';
import { addPageView } from '../../shared/ddb';

const body = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

interface Query {
  // TODO: switch from slug to scambled site/owner-pair...
  site?: string;
  resource?: string;
}

interface Headers {
  'User-Agent': string;
}

type Req = Request<void, Query, Headers>;

export const handler = async (req: Req): Promise<Response> => {
  const { site, resource } = req.queryStringParameters || {};
  // TODO: replace static 'test-user' with dynamic one...
  const owner = 'test-user';

  if (site && resource) {
    const { pathname, search } = new URL(resource, 'http://example.com');
    const doc = await arc.tables();

    try {
      // TODO: replace static 'test-user' with dynamic one...
      await addPageView(doc.analytics, site, owner, `${pathname}${search}`);
    } catch (err) {
      console.log(err);
    }
  }

  return {
    headers: {
      'content-type': 'image/gif',
      'cache-control':
        'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
    },
    statusCode: 200,
    isBase64Encoded: true,
    body,
  };
};
