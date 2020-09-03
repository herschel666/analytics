import arc from '@architect/functions';

import { pageIndex } from '../../pages/page-index';

interface Params {
  debug?: string;
}

interface Req {
  queryStringParameters: Params | null;
}

export const handler = async (req: Req) => {
  const { debug: debugParam } = req.queryStringParameters || {};
  const debug = debugParam === 'true' && process.env.NODE_ENV === 'testing';
  const { owner } = await arc.http.session.read<Req, { owner: string }>(req);

  return await pageIndex(owner, debug);
};
