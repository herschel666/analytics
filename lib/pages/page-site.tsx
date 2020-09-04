import h from 'vhtml';
import type { HC } from 'vhtml';
import * as arc from '@architect/functions';

import type { Response } from '../types/analytics';
import { getPageViewsBySite } from '../shared/ddb';
import type { PageView } from '../shared/ddb';
import { siteNameToHostname, daysAgo } from '../shared/util';
import { page } from './page';
import type { AggregatedPageView } from '../components/bar-chart/bar-chart';
import { BarChart } from '../components/bar-chart/bar-chart';

interface Props {
  site: string;
  pageViews: AggregatedPageView[];
  from?: string;
  to?: string;
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

const SitePage: HC<Props> = ({ site, pageViews, from = '', to = '' }) => (
  <div>
    <h1>{siteNameToHostname(site)}</h1>
    <a href={`/user/`}>Back</a>
    <form method="get" action={`/user/site/${site}?from=${from}&to=${to}`}>
      <fieldset>
        <legend>Set time range</legend>
        <label for="from">From</label>
        <input
          type="date"
          name="from"
          id="from"
          value={from}
          step="1"
          max={daysAgo(0)}
          placeholder="YYYY-MM-DD"
          data-format="YYYY-mm-dd"
        />
        <label for="to">To</label>
        <input
          type="date"
          name="to"
          id="to"
          value={to}
          step="1"
          max={daysAgo(0)}
          placeholder="YYYY-MM-DD"
          data-format="YYYY-mm-dd"
        />
        <button>Update</button>
      </fieldset>
    </form>
    {Boolean(pageViews.length) && (
      <div>
        <BarChart pageViews={pageViews} hostname={siteNameToHostname(site)} />
      </div>
    )}
  </div>
);

export const pageSite = async (
  site: string,
  owner: string,
  from?: string,
  to?: string
): Promise<Response> => {
  const doc = await arc.tables();
  const pageViews = await getPageViewsBySite(
    doc.analytics,
    site,
    owner,
    from,
    to
  );

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
        site={site}
        pageViews={aggregatedPageViews}
        from={from}
        to={to}
      />
    ),
  };
};
