import type { Data, APIGatewayResult as AGWResult } from '@architect/functions';

import { hostnameToSite } from '../shared/util';
import { addSite } from '../shared/ddb';
import { pageInternal } from '../pages/page-i';

interface Args {
  data: Data;
  owner: string;
  siteUrl?: string;
  debug?: string;
}

export const handler = async ({
  data,
  owner,
  siteUrl,
  debug: debugParam,
}: Args): Promise<AGWResult> => {
  const debug =
    typeof debugParam === 'string' && process.env.NODE_ENV === 'testing'
      ? debugParam.split(',')
      : undefined;

  if (siteUrl) {
    const { hostname } = new URL(siteUrl);

    // TODO: provide user feedback on error
    await addSite(data.analytics, hostnameToSite(hostname), owner);
  }

  const body = await pageInternal(owner, debug);

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
