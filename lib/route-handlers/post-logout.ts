import type { APIGatewayResult as AGWResult } from '@architect/functions';

export const handler = (cookie: string): AGWResult => ({
  statusCode: 301,
  headers: {
    'set-cookie': cookie,
    location: '/',
  },
});
