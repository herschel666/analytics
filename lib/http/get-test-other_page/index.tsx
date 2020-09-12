import * as arc from '@architect/functions';
import type { APIGatewayResult as AGWResult } from '@architect/functions';
import type { APIGatewayEvent as AGWEvent } from 'aws-lambda';

import { getSite } from '../../shared/ddb';

export const otherPage = (id: string): string => /* html */ `
  <div>
    <h1>Other Page</h1>
    <p>
      <a href="/test/some-page">Some page</a>
    </p>
    <script>
((pixel, trackingId, pathname, search, referrer) => {
  const src = pixel + '?' + 'id=' + trackingId + '&resource=' + encodeURIComponent(pathname + search) + '&referrer=' + encodeURIComponent(referrer);
  Object.assign(new Image(), { src });
})('http://localhost:3333/cctv.gif', '${id}', location.pathname, location.search, document.referrer);
    </script>
  </div>
`;

export const handler = async (req: AGWEvent): Promise<AGWResult> => {
  const { owner } = await arc.http.session.read<{ owner: string }>(req);
  const doc = await arc.tables();
  const { hash: id } = await getSite(doc.analytics, 'localhost', owner);

  return {
    headers: {
      'content-type': 'text/html; charset=utf8',
      'cache-control':
        'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
    },
    statusCode: 200,
    body: otherPage(id),
  };
};
