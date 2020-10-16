import type {
  Data,
  ArcQueues,
  APIGatewayResult as AGWResult,
} from '@architect/functions';

import { handler as routeHandler } from '../route-handlers/get-i-site-000site-settings';

interface Args {
  queues: ArcQueues;
  data: Data;
  site: string;
  owner: string;
}

// TODO: add tests
export const handler = async ({
  queues,
  data,
  site,
  owner,
}: Args): Promise<AGWResult> => {
  try {
    const key = `SITE#${owner}#${site}`;
    const deletion = data.analytics.delete({ PK: key, SK: key });
    const publish = queues.publish({
      name: 'delegate-site-deletion',
      payload: { site, owner },
    });
    await Promise.all([deletion, publish]);
  } catch (err) {
    console.log(err);
    return routeHandler({ data, site, owner, error: true });
  }

  // TOOD: put name of deleted site into session value & give feedback on startpage
  return {
    statusCode: 301,
    headers: {
      location: '/i',
    },
  };
};
