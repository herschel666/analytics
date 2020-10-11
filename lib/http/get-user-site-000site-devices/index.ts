import type { APIGatewayEvent as AGWEvent } from 'aws-lambda';
import type { APIGatewayResult as AGWResult } from '@architect/functions';

import { handler as routeHandler } from '../../route-handlers/get-user-site-000site-devices';

export const handler = async (req: AGWEvent): Promise<AGWResult> => {
  const { site } = req.pathParameters;

  return routeHandler({ site });
};
