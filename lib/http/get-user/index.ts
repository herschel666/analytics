import * as arc from '@architect/functions';
import type { APIGatewayResult as AGWResult } from '@architect/functions';
import type { APIGatewayEvent as AGWEvent } from 'aws-lambda';

import { pageIndex } from '../../pages/page-index';

export const handler = async (req: AGWEvent): Promise<AGWResult> => {
  const { debug: debugParam } = req.queryStringParameters || {};
  const debug = debugParam === 'true' && process.env.NODE_ENV === 'testing';
  const { owner } = await arc.http.session.read<{ owner: string }>(req);

  return await pageIndex(owner, debug);
};
