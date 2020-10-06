import * as arc from '@architect/functions';
import type {
  SubsequentAsyncHandlerEvent as AGWEvent,
  APIGatewayResult as AGWResult,
} from '@architect/functions';

import { withOwner } from '../../shared/with-owner';
import { pageUserSite } from '../../pages/page-user-site';
import { isValidDate, daysAgo } from '../../shared/util';

const sortInterval = (
  fromDate: string | undefined,
  toDate: string | undefined
): [string | undefined, string | undefined] => {
  const from = isValidDate(fromDate) ? fromDate : daysAgo(7);
  const to = isValidDate(toDate) ? toDate : daysAgo(0);
  const fromNumber = Number(from.split('-').join(''));
  const toNumber = Number(to.split('-').join(''));

  if (fromNumber < toNumber) {
    return [from, to];
  } else {
    return [to, from];
  }
};

export const servePageUserSite = async (req: AGWEvent): Promise<AGWResult> => {
  const { site } = req.pathParameters;
  const { from: fromDate, to: toDate, cursor: cursorParam } =
    req.queryStringParameters || {};
  // TODO: store interval by site in session
  const [from, to] = sortInterval(
    isValidDate(fromDate) ? fromDate : undefined,
    isValidDate(toDate) ? toDate : undefined
  );
  const { owner } = req.session;
  const cursor =
    typeof cursorParam === 'string' && cursorParam.length
      ? cursorParam
      : undefined;
  // TODO: handle non-exisiting site
  const body = await pageUserSite(site, owner, from, to, cursor);

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

export const handler = arc.http.async(withOwner, servePageUserSite);
