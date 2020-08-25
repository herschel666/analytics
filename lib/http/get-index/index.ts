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

  return await pageIndex(debug);
};
