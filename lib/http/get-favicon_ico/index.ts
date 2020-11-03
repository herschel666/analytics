import type { APIGatewayResult as AGWResult } from '@architect/functions';

import favicon from './favicon.ico';

const TEN_DAYS = 60 * 60 * 24 * 10;

export const handler = async (): Promise<AGWResult> => {
  return {
    headers: {
      'content-type': 'image/x-icon',
      'cache-control': `max-age=${TEN_DAYS}`,
    },
    statusCode: 200,
    isBase64Encoded: true,
    body: favicon,
  };
};
