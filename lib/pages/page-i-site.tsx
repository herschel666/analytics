import h from 'vhtml';
import type { HC } from 'vhtml';

import type { PageView } from '../shared/ddb';
import { siteNameToHostname, daysAgo, niceMonth } from '../shared/util';
import { pageFrame } from '../shared/page-frame';
import { Layout } from '../components/layout';
import { TabNav, TabItem } from '../components/tab-nav';
import { LineChart } from '../components/line-chart';

interface Args {
  pageViews: PageView[];
  site: string;
  owner: string;
  from?: string;
  to?: string;
  cursor?: string;
  newCursor?: string;
}

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

const dayInSeconds = 1000 * 60 * 60 * 24;

const bridgeDateGaps = (
  from: string,
  to: string,
  pageViews: AggregatedPageView[]
): AggregatedPageView[] => {
  const interval: AggregatedPageView[] = [];
  const limit = new Date(to).getTime();
  let nextDay = new Date(from);

  do {
    const date = nextDay.toISOString().split('T').shift();
    const size = new Date(date).getTime();

    if (size > limit) {
      break;
    }

    const { pageViews: pageViewCount } = pageViews.find(
      ({ date: d }) => d === date
    ) || { pageViews: 0 };
    interval.push({ pageViews: pageViewCount, date });
    nextDay = new Date(nextDay.getTime() + dayInSeconds);
  } while (true);

  return interval;
};

const getAggregatedPageViews = (pageViews: PageView[]): AggregatedPageView[] =>
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

const Page: HC<Props> = ({
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
  const pagePath = `/i/site/${site}`;

  return (
    <Layout loggedIn={true} text={siteNameToHostname(site)}>
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

export const pageSite = ({
  pageViews,
  site,
  owner,
  from,
  to,
  cursor,
  newCursor,
}: Args): string => {
  const aggregatedPageViews = bridgeDateGaps(
    from,
    to,
    getAggregatedPageViews(pageViews)
  );
  const dates = aggregatedPageViews.map(({ date }) => formatDate(date));
  const hits = aggregatedPageViews.map(({ pageViews }) => pageViews);

  return pageFrame(
    <Page
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
