import * as arc from '@architect/functions';

import type { Request, Response } from '../../types/analytics';
import { pageIndex } from '../../pages/page-index';

interface Query {
  debug?: string;
}

type Req = Request<void, Query>;

export const handler = async (req: Req): Promise<Response> => {
  const { debug: debugParam } = req.queryStringParameters || {};
  const debug = debugParam === 'true' && process.env.NODE_ENV === 'testing';
  const { owner } = await arc.http.session.read<Req, { owner: string }>(req);

  return await pageIndex(owner, debug);
};
