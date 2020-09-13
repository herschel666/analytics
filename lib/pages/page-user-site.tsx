import h from 'vhtml';
import type { HC } from 'vhtml';
import * as arc from '@architect/functions';

import { getPageViewsBySite } from '../shared/ddb';
import type { PageView } from '../shared/ddb';
import { siteNameToHostname, daysAgo } from '../shared/util';
import { page } from './page';
import type { AggregatedPageView } from '../components/bar-chart/bar-chart';
import { BarChart } from '../components/bar-chart/bar-chart';

interface Props {
  site: string;
  owner: string;
  pageViews: AggregatedPageView[];
  from?: string;
  to?: string;
  prev?: string;
  hasNext?: boolean;
}

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

const UserSitePage: HC<Props> = ({
  site,
  pageViews,
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
      {Boolean(pageViews.length) && (
        <div>
          <BarChart pageViews={pageViews} hostname={siteNameToHostname(site)} />
        </div>
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

  return page(
    <UserSitePage
      site={site}
      owner={owner}
      pageViews={aggregatedPageViews}
      from={from}
      to={to}
      prev={newCursor}
      hasNext={typeof cursor === 'string'}
    />
  );
};
