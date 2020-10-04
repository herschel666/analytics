import h from 'vhtml';
import type { HC } from 'vhtml';
import * as arc from '@architect/functions';

import { getPageViewsBySite } from '../shared/ddb';
import type { PageView } from '../shared/ddb';
import { siteNameToHostname, daysAgo, niceMonth } from '../shared/util';
import { page } from './page';
import { Layout } from '../components/layout/layout';
import { TabNav, TabItem } from '../components/tab-nav/tab-nav';
import { LineChart } from '../components/line-chart/line-chart';

interface Props {
  site: string;
  owner: string;
  dates: string[];
  hits: number[];
  from?: string;
  to?: string;
  prev?: string;
  hasNext?: boolean;
}

type AggregatedPageView = Pick<PageView, 'date' | 'pageViews'>;

const getAggregatedPageViews = (pageViews: PageView[]) =>
  pageViews
    .reduce((acc: AggregatedPageView[], { date, pageViews }: PageView) => {
      const lastIndex = acc.length - 1;
      if (lastIndex > -1 && acc[lastIndex].date === date) {
        acc[lastIndex].pageViews += pageViews;
      } else {
        acc.push({ date, pageViews });
      }
      return acc;
    }, [])
    .sort(({ date: a }, { date: b }) =>
      new Date(a).getTime() > new Date(b).getTime() ? 1 : -1
    );

const formatDate = (date: string): string => {
  const [year, month, day] = date.split('-');
  return `${day}. ${niceMonth(month)} ${year}`;
};

const UserSitePage: HC<Props> = ({
  site,
  dates,
  hits,
  from = '',
  to = '',
  prev,
  hasNext,
}) => {
  const prevParam = prev ? `cursor=${prev}` : undefined;
  const fromParam = from ? `from=${from}` : undefined;
  const toParam = to ? `to=${to}` : undefined;
  const prevSearch = [prevParam, fromParam, toParam].filter(Boolean).join('&');
  const pagePath = `/user/site/${site}`;

  return (
    <Layout text={siteNameToHostname(site)}>
      <TabNav site={site} current={TabItem.PageViews} />
      <form method="get" action={pagePath} class="my-4">
        <fieldset>
          <h5>Set time range</h5>
          <div class="row">
            <div class="col">
              <label for="from" class="visually-hidden">
                Start date of time range
              </label>
              <input
                type="date"
                name="from"
                id="from"
                value={from}
                step="1"
                max={daysAgo(0)}
                placeholder="YYYY-MM-DD"
                data-format="YYYY-mm-dd"
                class="form-control"
              />
            </div>
            <div class="col">
              <label for="to" class="visually-hidden">
                End date of time range
              </label>
              <input
                type="date"
                name="to"
                id="to"
                value={to}
                step="1"
                max={daysAgo(0)}
                placeholder="YYYY-MM-DD"
                data-format="YYYY-mm-dd"
                class="form-control"
              />
            </div>
            <div class="col">
              <button type="submit" class="btn btn-primary">
                Update
              </button>
            </div>
          </div>
        </fieldset>
      </form>
      {Boolean(dates.length && hits.length) && (
        <LineChart
          site={site}
          from={from}
          to={to}
          dates={JSON.stringify(dates)}
          hits={JSON.stringify(hits)}
        />
      )}
      {Boolean(prev) && <a href={`${pagePath}?${prevSearch}`}>Previous page</a>}
      {hasNext && <a href="javascript:history.back()">Next page</a>}
    </Layout>
  );
};

export const pageUserSite = async (
  site: string,
  owner: string,
  from?: string,
  to?: string,
  cursor?: string
): Promise<string> => {
  const doc = await arc.tables();
  const { views: pageViews, cursor: newCursor } = await getPageViewsBySite(
    doc.analytics,
    site,
    owner,
    from,
    to,
    cursor
  );
  const aggregatedPageViews = getAggregatedPageViews(pageViews);
  const dates = aggregatedPageViews.map(({ date }) => formatDate(date));
  const hits = aggregatedPageViews.map(({ pageViews }) => pageViews);

  return page(
    <UserSitePage
      site={site}
      owner={owner}
      dates={dates}
      hits={hits}
      from={from}
      to={to}
      prev={newCursor}
      hasNext={typeof cursor === 'string'}
    />
  );
};
