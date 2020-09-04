import h from 'vhtml';
import type { HC } from 'vhtml';

import type { Request, Response } from '../../types/analytics';

export const OtherPage: HC<{ resource: string }> = ({ resource }) => (
  <div>
    <h1>Other Page</h1>
    <p>
      <a href="/test/some-page">Some page</a>
    </p>
    <img src={`/cctv.gif?site=localhost&resource=${resource}`} alt="" />
  </div>
);

export const handler = async (req: Request): Promise<Response> => {
  const pathname = encodeURIComponent(req.resource);
  const search = new URLSearchParams(
    req.queryStringParameters || {}
  ).toString();
  const glue = search ? encodeURIComponent('?') : '';
  const resource = `${pathname}${glue}${encodeURIComponent(search)}`;

  return {
    headers: {
      'content-type': 'text/html; charset=utf8',
      'cache-control':
        'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
    },
    statusCode: 200,
    body: <OtherPage resource={resource} />,
  };
};
