import type { Data, APIGatewayResult as AGWResult } from '@architect/functions';

import { getPageViewsBySite } from '../shared/ddb';
import { pageSite } from '../pages/page-i-site';
import { isValidDate, daysAgo } from '../shared/util';

interface Args {
  data: Data;
  owner: string;
  site: string;
  from?: string;
  to?: string;
  cursor?: string;
}

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

export const handler = async ({
  data,
  owner,
  site,
  from: fromDate,
  to: toDate,
  cursor: cursorParam,
}: Args): Promise<AGWResult> => {
  // TODO: store interval by site in session
  const [from, to] = sortInterval(
    isValidDate(fromDate) ? fromDate : undefined,
    isValidDate(toDate) ? toDate : undefined
  );
  const cursor =
    typeof cursorParam === 'string' && cursorParam.length
      ? cursorParam
      : undefined;
  const { views: pageViews, cursor: newCursor } = await getPageViewsBySite(
    data.analytics,
    site,
    owner,
    from,
    to,
    cursor
  );
  // TODO: handle non-exisiting site
  const body = pageSite({
    newCursor,
    cursor,
    pageViews,
    site,
    owner,
    from,
    to,
  });

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
