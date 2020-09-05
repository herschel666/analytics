import * as arc from '@architect/functions';
import type { APIGatewayResult as AGWResult } from '@architect/functions';
import type { APIGatewayEvent as AGWEvent } from 'aws-lambda';

import { addPageView } from '../../shared/ddb';

const body = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

export const handler = async (req: AGWEvent): Promise<AGWResult> => {
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
