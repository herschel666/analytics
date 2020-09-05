import * as arc from '@architect/functions';
import type {
  SubsequentAsyncHandlerEvent as AGWEvent,
  APIGatewayResult as AGWResult,
} from '@architect/functions';

import { withOwner } from '../../shared/with-owner';
import { pageUser } from '../../pages/page-user';

const servePageUser = async (req: AGWEvent): Promise<AGWResult> => {
  const { debug: debugParam } = req.queryStringParameters || {};
  const debug = debugParam === 'true' && process.env.NODE_ENV === 'testing';
  const { owner } = req.session;
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

export const handler = arc.http.async(withOwner, servePageUser);
