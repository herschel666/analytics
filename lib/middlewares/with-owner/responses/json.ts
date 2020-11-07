import type { APIGatewayResult as AGWResult } from '@architect/functions';

export const forbiddenJson = (): AGWResult => {
  const body = JSON.stringify({ message: 'Not allowed' });

  return {
    statusCode: 401,
    headers: {
      'content-type': 'application/json; charset=utf8',
      'cache-control':
        'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
    },
    body,
  };
};
