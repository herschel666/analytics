import type { APIGatewayResult as AGWResult } from '@architect/functions';

import { pageUser } from '../pages/page-user';

interface Args {
  owner: string;
  debug?: string;
}

export const handler = async ({
  owner,
  debug: debugParam,
}: Args): Promise<AGWResult> => {
  const debug =
    typeof debugParam === 'string' && process.env.NODE_ENV === 'testing'
      ? debugParam.split(',')
      : undefined;
  const body = await pageUser(owner, debug);

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
