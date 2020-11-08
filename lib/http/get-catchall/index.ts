import type { APIGatewayResult as AGWResult } from '@architect/functions';

import { pageNotFound } from '../../pages/page-not-found';

export const handler = async (): Promise<AGWResult> => {
  return {
    statusCode: 404,
    headers: {
      'content-type': 'text/html; charset=utf8',
      'cache-control':
        'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
    },
    body: pageNotFound(),
  };
};
