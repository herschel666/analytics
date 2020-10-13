import type { APIGatewayResult as AGWResult } from '@architect/functions';

import { isValidDate, atob } from '../shared/util';
import { pageSiteDate } from '../pages/page-i-site-date';

interface Args {
  owner: string;
  site: string;
  date: string;
  range: string;
}

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

export const handler = async ({
  owner,
  site,
  date,
  range,
}: Args): Promise<AGWResult> => {
  const { from, to } = getRange(range);
  const body = await pageSiteDate(site, owner, date, from, to);

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
