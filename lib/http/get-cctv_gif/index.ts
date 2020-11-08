import * as arc from '@architect/functions';
import type { APIGatewayResult as AGWResult } from '@architect/functions';
import type { APIGatewayEvent as AGWEvent } from 'aws-lambda';

import { handler as routeHandler } from '../../route-handlers/get-cctv_gif';

export const handler = async (req: AGWEvent): Promise<AGWResult> => {
  const { id, resource, referrer } = req.queryStringParameters || {};

  return routeHandler({
    headers: req.headers,
    queues: arc.queues,
    id,
    resource,
    referrer,
  });
};
