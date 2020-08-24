import h from 'vhtml';
import type { HC } from 'vhtml';
import arc from '@architect/functions';

import {
  getTable,
  getSites,
  getPageViewsBySite,
  getPageViewsBySiteAndDate,
} from '../shared/ddb';
import type { PageView } from '../shared/ddb';
import { getParams, siteNameToHostname } from '../shared/util';
import { page } from './page';
import type { AggregatedPageView } from '../components/bar-chart/bar-chart';
import { BarChart } from '../components/bar-chart/bar-chart';

type DDBPromise = [
  Promise<string>,
  Promise<string[]>,
  Promise<PageView[]>,
  Promise<PageView[]>
];
type DDBResults = [string, string[], PageView[], PageView[]];

interface Props {
  site?: string;
  date?: string;
  sites: string[];
  pageViews: PageView[];
  aggregatedPageViews: AggregatedPageView[];
  table: string;
  debug: boolean;
}

interface Response {
  headers: Record<string, string>;
  statusCode: number;
  body: string;
}

const sortPageViewsPerDate = (a: PageView, b: PageView) => {
  switch (true) {
    case a.pageViews > b.pageViews:
      return -1;
    case a.pageViews < b.pageViews:
      return 1;
    default:
      return 0;
  }
};

const IndexPage: HC<Props> = ({
  site,
  date,
  sites,
  aggregatedPageViews,
  pageViews,
  table,
  debug,
}) => (
  <div>
    <h1>ek|analytics</h1>
    <form method="post" action={`/${getParams(debug, site, date)}`}>
      <fieldset>
        <legend>Add a new site…</legend>
        <div>
          <label for="site_url">Site URL</label>
          <input
            type="url"
            id="site_url"
            name="site_url"
            placeholder="Your site's URL…"
          />
        </div>
        <button>Submit</button>
      </fieldset>
    </form>
    {Boolean(sites.length) && (
      <div>
        <hr />
        <ul>
          {sites.map((site) => (
            <li>
              <a href={`/${getParams(debug, site)}`}>
                {siteNameToHostname(site)}
              </a>
            </li>
          ))}
        </ul>
      </div>
    )}
    <hr />
    {Boolean(pageViews.length) && (
      <div>
        {Boolean(site) && <a href={`/${getParams(debug, site)}`}>Back</a>}
        <table border="1" cellPadding="8">
          <caption>Page Views for {date}</caption>
          <thead>
            <tr>
              <th>#</th>
              <th>Pathname</th>
              <th>Page Views</th>
            </tr>
          </thead>
          <tbody>
            {pageViews.map(({ pathname, pageViews }, i) => (
              <tr>
                <td># {i + 1}</td>
                <td>{pathname}</td>
                <td>{pageViews}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
    {Boolean(aggregatedPageViews.length) && (
      <div>
        <a href={`/${getParams(debug)}`}>Remove</a>
        <BarChart
          aggregatedPageViews={aggregatedPageViews}
          site={site}
          debug={debug}
        />
      </div>
    )}
    {debug && (
      <details>
        <summary>DDB Dump</summary>
        <pre>{table}</pre>
      </details>
    )}
  </div>
);

export const pageIndex = async (
  debug: boolean,
  site?: string,
  date?: string
): Promise<Response> => {
  const doc = await arc.tables();
  const promises: DDBPromise = [
    Promise.resolve(''),
    getSites(doc.analytics),
    Promise.resolve([]),
    Promise.resolve([]),
  ];

  if (debug) {
    promises[0] = getTable(doc.analytics);
  }

  // TODO: handle non-exisiting site...
  if (site) {
    if (date) {
      promises[3] = getPageViewsBySiteAndDate(doc.analytics, site, date);
    } else {
      promises[2] = getPageViewsBySite(doc.analytics, site);
    }
  }
  const [table, sites, pageViews, pageViewsPerDate] = (await Promise.all(
    promises
  )) as DDBResults;

  const aggregatedPageViews = pageViews.reduce(
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

  return {
    headers: {
      'content-type': 'text/html; charset=utf8',
      'cache-control':
        'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
    },
    statusCode: 200,
    body: page(
      <IndexPage
        site={site}
        date={date}
        sites={sites}
        aggregatedPageViews={aggregatedPageViews}
        pageViews={pageViewsPerDate.sort(sortPageViewsPerDate)}
        table={table}
        debug={debug}
      />
    ),
  };
};
