import h from 'vhtml';
import type { HC } from 'vhtml';
import arc from '@architect/functions';

import { getPageViewsBySite } from '../shared/ddb';
import type { PageView } from '../shared/ddb';
import { siteNameToHostname } from '../shared/util';
import { page } from './page';
import type { AggregatedPageView } from '../components/bar-chart/bar-chart';
import { BarChart } from '../components/bar-chart/bar-chart';

interface Props {
  hostname: string;
  pageViews: AggregatedPageView[];
}

interface Response {
  headers: Record<string, string>;
  statusCode: number;
  body: string;
}

const getAggregatedPageViews = (pageViews: PageView[]) =>
  pageViews.reduce(
    (acc: AggregatedPageView[], { date, pageViews }: PageView) => {
      const lastIndex = acc.length - 1;
      if (lastIndex > -1 && acc[lastIndex].date === date) {
        acc[lastIndex].pageViews += pageViews;
      } else {
        acc.push({ date, pageViews });
      }
      return acc;
    },
    []
  );

const SitePage: HC<Props> = ({ hostname, pageViews }) => (
  <div>
    <h1>{hostname}</h1>
    {Boolean(pageViews.length) && (
      <div>
        <a href="/">Back</a>
        <BarChart pageViews={pageViews} hostname={hostname} />
      </div>
    )}
  </div>
);

export const pageSite = async (site: string): Promise<Response> => {
  const doc = await arc.tables();
  const pageViews = await getPageViewsBySite(doc.analytics, site);

  const aggregatedPageViews = getAggregatedPageViews(pageViews);

  return {
    headers: {
      'content-type': 'text/html; charset=utf8',
      'cache-control':
        'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
    },
    statusCode: 200,
    body: page(
      <SitePage
        hostname={siteNameToHostname(site)}
        pageViews={aggregatedPageViews}
      />
    ),
  };
};
