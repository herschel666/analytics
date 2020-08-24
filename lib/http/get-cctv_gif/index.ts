import arc from '@architect/functions';

import { addPageView } from '../../shared/ddb';

const body = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

interface Params {
  site?: string;
  resource?: string;
}

interface Req {
  queryStringParameters: Params | null;
  headers: {
    'User-Agent': string;
  };
}

export const handler = async (req: Req) => {
  const { site, resource } = req.queryStringParameters || {};

  if (site && resource) {
    const { pathname, search } = new URL(resource, 'http://example.com');
    const doc = await arc.tables();

    try {
      await addPageView(doc.analytics, site, `${pathname}${search}`);
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
