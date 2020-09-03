import h from 'vhtml';
import type { HC } from 'vhtml';
import arc from '@architect/functions';

import { getPageViewsBySiteAndDate } from '../shared/ddb';
import type { PageView } from '../shared/ddb';
import { hostnameToSite, siteNameToHostname } from '../shared/util';
import { page } from './page';

interface Props {
  hostname: string;
  date: string;
  pageViews: PageView[];
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

const IndexPage: HC<Props> = ({ hostname, date, pageViews }) => (
  <div>
    <h1>
      {hostname} — {date}
    </h1>
    {Boolean(pageViews.length) && (
      <div>
        <a href={`/user/site/${hostnameToSite(hostname)}`}>Back</a>
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
  </div>
);

export const pageSiteDate = async (
  site: string,
  owner: string,
  date: string
): Promise<Response> => {
  const doc = await arc.tables();
  const pageViewsPerDate = await getPageViewsBySiteAndDate(
    doc.analytics,
    site,
    owner,
    date
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
        hostname={siteNameToHostname(site)}
        date={date}
        pageViews={pageViewsPerDate.sort(sortPageViewsPerDate)}
      />
    ),
  };
};
