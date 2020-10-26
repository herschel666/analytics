import * as arc from '@architect/functions';
import type { APIGatewayResult as AGWResult } from '@architect/functions';

import { handler as routeHandler } from '../../route-handlers/post-logout';

export const handler = async (): Promise<AGWResult> => {
  const cookie = await arc.http.session.write({});

  return routeHandler(cookie);
};
