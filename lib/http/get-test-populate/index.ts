import * as arc from '@architect/functions';
import type { Data } from '@architect/functions';
import * as faker from 'faker';
import { UAParser } from 'ua-parser-js';
import type { APIGatewayResult as AGWResult } from '@architect/functions';

import { hostnameToSite, getUserAgent } from '../../shared/util';
import { addSite, addPageView } from '../../shared/ddb';

const DAYS = 40;

const parser = new UAParser();

const sites = Array.from({ length: 3 }, () => faker.internet.domainName()).map(
  hostnameToSite
);
const dates = Array.from({ length: DAYS }, (_, i: number) =>
  new Date(Date.now() - (DAYS - i) * 24 * 3600 * 1000).getTime()
);
const referrers = Array.from({ length: 12 }, () => faker.internet.url());

const getPathname = () =>
  Array.from({ length: faker.random.number(2) + 1 }, () => faker.lorem.slug())
    .concat([''])
    .reverse()
    .join('/');

const getReferrer = (): string | undefined => {
  const i = faker.random.number(referrers.length);
  if (i === 0) {
    return undefined;
  }
  const pathname = faker.lorem
    .words(faker.random.number(3))
    .split(' ')
    .join('/');
  return new URL(pathname, referrers[i - 1]).toString();
};

const createPageViewsForSite = (
  doc: Data,
  sitesPathnames: [string, string[]][],
  date: number
): Promise<void>[] =>
  sitesPathnames.reduce(
    (acc, [site, pathnames]) =>
      acc.concat(
        pathnames
          .map((pathname) =>
            Array.from({ length: faker.random.number(5) }, () =>
              // TODO: replace static 'test-user' with dynamic one...
              addPageView(
                doc,
                site,
                'test-user',
                pathname,
                getUserAgent(parser, faker.internet.userAgent()),
                getReferrer(),
                date
              )
            )
          )
          .flat()
      ),
    []
  );

export const handler = async (): Promise<AGWResult> => {
  const doc = await arc.tables();
  const sitesPathnames: [string, string[]][] = sites.map((site) => [
    site,
    Array.from({ length: Math.max(5, faker.random.number(10)) }, () =>
      getPathname()
    ),
  ]);

  await Promise.all(
    sites.reduce(
      (acc, site) =>
        acc.concat([
          // TODO: replace static 'test-user' with dynamic one...
          addSite(doc.analytics, site, 'test-user'),
          ...dates
            .map((date) => createPageViewsForSite(doc, sitesPathnames, date))
            .flat(),
        ]),
      [] as Promise<void>[]
    )
  );

  return {
    statusCode: 301,
    headers: {
      location: '/',
    },
  };
};
