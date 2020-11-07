import type { Data, APIGatewayResult as AGWResult } from '@architect/functions';

import { getSites } from '../shared/ddb';

interface Args {
  data: Data;
  owner: string;
}

export const handler = async ({ data, owner }: Args): Promise<AGWResult> => {
  const sites = await getSites(data.analytics, owner);

  return {
    headers: {
      'content-type': 'application/json; charset=utf8',
      'cache-control':
        'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
    },
    statusCode: 200,
    body: JSON.stringify(sites),
  };
};
