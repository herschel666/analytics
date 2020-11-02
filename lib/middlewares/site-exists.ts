import * as arc from '@architect/functions';
import type {
  SubsequentAsyncHandlerEvent as AGWEvent,
  APIGatewayResult as AGWResult,
} from '@architect/functions';

import { getSite } from '../shared/ddb';
import { pageNotFound } from '../pages/page-not-found';

export const siteExists = async (
  req: AGWEvent
): Promise<AGWEvent | AGWResult> => {
  if (req.resource.includes('/{site}')) {
    const { site } = req.pathParameters;
    const { owner } = req.session;
    const data = await arc.tables();
    const siteEntry = await getSite(data.analytics, site, owner);

    if (!siteEntry) {
      return {
        statusCode: 404,
        headers: {
          'content-type': 'text/html; charset=utf8',
          'cache-control':
            'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
        },
        body: pageNotFound(),
      };
    }
  }
  return req;
};
