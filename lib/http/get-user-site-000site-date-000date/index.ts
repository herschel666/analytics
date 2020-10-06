import * as arc from '@architect/functions';
import type {
  SubsequentAsyncHandlerEvent as AGWEvent,
  APIGatewayResult as AGWResult,
} from '@architect/functions';

import { isValidDate, atob } from '../../shared/util';
import { withOwner } from '../../shared/with-owner';
import { pageUserSiteDate } from '../../pages/page-user-site-date';

interface Range {
  from?: string;
  to?: string;
}

const getRange = (range: string): Range => {
  try {
    const obj = JSON.parse(atob(decodeURIComponent(range)));
    const from =
      typeof obj.from === 'string' && isValidDate(obj.from)
        ? obj.from
        : undefined;
    const to =
      typeof obj.to === 'string' && isValidDate(obj.to) ? obj.to : undefined;
    return { from, to };
  } catch {
    return {};
  }
};

export const servePageUserSiteDate = async (
  req: AGWEvent
): Promise<AGWResult> => {
  const { site, date } = req.pathParameters;
  const { range } = req.queryStringParameters || { range: '' };
  const { from, to } = getRange(range);
  const { owner } = await arc.http.session.read<{ owner: string }>(req);
  const body = await pageUserSiteDate(site, owner, date, from, to);

  return {
    headers: {
      'content-type': 'text/html; charset=utf8',
      'cache-control':
        'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
    },
    statusCode: 200,
    body,
  };
};

export const handler = arc.http.async(withOwner, servePageUserSiteDate);
