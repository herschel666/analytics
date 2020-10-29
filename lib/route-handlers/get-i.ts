import type { Data, APIGatewayResult as AGWResult } from '@architect/functions';

import { getTable, getSites } from '../shared/ddb';
import type { TableItem } from '../shared/ddb';
import { pageInternal } from '../pages/page-i';

type DDBPromise = [Promise<TableItem[]>, Promise<string[]>];
type DDBResults = [TableItem[], string[]];

interface Args {
  data: Data;
  owner: string;
  error?: boolean;
  debug?: string;
}

export const handler = async ({
  data,
  owner,
  error,
  debug: debugParam,
}: Args): Promise<AGWResult> => {
  const debug =
    typeof debugParam === 'string' && process.env.NODE_ENV === 'testing'
      ? debugParam.split(',')
      : undefined;
  const promises: DDBPromise = [
    Promise.resolve([]),
    getSites(data.analytics, owner),
  ];

  if (debug) {
    promises[0] = getTable(data.analytics);
  }
  const [table, sites] = (await Promise.all(promises)) as DDBResults;
  const body = pageInternal({ sites, table, error, debug });

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
