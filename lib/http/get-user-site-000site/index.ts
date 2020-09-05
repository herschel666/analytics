import * as arc from '@architect/functions';
import type { APIGatewayResult as AGWResult } from '@architect/functions';
import type { APIGatewayEvent as AGWEvent } from 'aws-lambda';

import { pageSite } from '../../pages/page-site';
import { daysAgo } from '../../shared/util';

const isValidDate = (date: string): boolean => {
  try {
    return new Date(date).toISOString().split('T').shift() === date;
  } catch {
    return false;
  }
};

const sortInterval = (
  fromDate: string | undefined,
  toDate: string | undefined
): [string | undefined, string | undefined] => {
  const from = isValidDate(fromDate) ? fromDate : daysAgo(14);
  const to = isValidDate(toDate) ? toDate : daysAgo(0);
  const fromNumber = Number(from.split('-').join(''));
  const toNumber = Number(to.split('-').join(''));

  if (fromNumber < toNumber) {
    return [from, to];
  } else {
    return [to, from];
  }
};

export const handler = async (req: AGWEvent): Promise<AGWResult> => {
  const { site } = req.pathParameters;
  const { from: fromDate, to: toDate } = req.queryStringParameters || {};
  const [from, to] = sortInterval(
    isValidDate(fromDate) ? fromDate : undefined,
    isValidDate(toDate) ? toDate : undefined
  );
  const { owner } = await arc.http.session.read<{ owner: string }>(req);
  // TODO: store interval by site in session

  return await pageSite(site, owner, from, to);
};
