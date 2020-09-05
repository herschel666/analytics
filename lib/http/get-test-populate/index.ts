import * as arc from '@architect/functions';
import type { ArcTableClient } from '@architect/functions';
import * as faker from 'faker';
import type { APIGatewayResult as AGWResult } from '@architect/functions';

import { hostnameToSite } from '../../shared/util';
import { addSite, addPageView } from '../../shared/ddb';

const DAYS = 40;

const sites = Array.from({ length: 3 }, () => faker.internet.domainName()).map(
  hostnameToSite
);
const dates = Array.from({ length: DAYS }, (_, i: number) =>
  new Date(Date.now() - (DAYS - i) * 24 * 3600 * 1000).getTime()
);

const getPathname = () =>
  Array.from({ length: faker.random.number(2) + 1 }, () => faker.lorem.slug())
    .concat([''])
    .reverse()
    .join('/');

const createPageViewsForSite = (
  tableClient: ArcTableClient,
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
              addPageView(tableClient, site, 'test-user', pathname, date)
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
            .map((date) =>
              createPageViewsForSite(doc.analytics, sitesPathnames, date)
            )
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
