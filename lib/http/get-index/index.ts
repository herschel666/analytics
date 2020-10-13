import * as arc from '@architect/functions';
import type { APIGatewayResult as AGWResult } from '@architect/functions';

import { handler as routeHandler } from '../../route-handlers/get-index';

export const handler = async (): Promise<AGWResult> => {
  // TODO: replace static 'test-user' with dynamic one...
  const owner = 'test-user';
  const cookie = await arc.http.session.write({ owner });
  const location = arc.http.helpers.url('/i');

  // TODO: implement authentication...
  return routeHandler({ cookie, location });
};
