import h from 'vhtml';
import type { HC } from 'vhtml';
import * as arc from '@architect/functions';

import { getPageViewsBySite } from '../shared/ddb';
import type { PageView } from '../shared/ddb';
import { siteNameToHostname, daysAgo } from '../shared/util';
import { page } from './page';
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
  const abbreviations = {
    '01': 'Jan',
    '02': 'Feb',
    '03': 'Mar',
    '04': 'Apr',
    '05': 'May',
    '06': 'Jun',
    '07': 'Jul',
    '08': 'Aug',
    '09': 'Sep',
    '10': 'Oct',
    '11': 'Nov',
    '12': 'Dec',
  };
  return `${day}.${abbreviations[month]}${year}`;
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
    <div>
      <h1>{siteNameToHostname(site)}</h1>
      <a href="/user">Back</a>
      <form method="get" action={pagePath}>
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
      {Boolean(dates.length && hits.length) && (
        <LineChart dates={JSON.stringify(dates)} hits={JSON.stringify(hits)} />
      )}
      {Boolean(prev) && <a href={`${pagePath}?${prevSearch}`}>Previous page</a>}
      {hasNext && <a href="javascript:history.back()">Next page</a>}
    </div>
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
