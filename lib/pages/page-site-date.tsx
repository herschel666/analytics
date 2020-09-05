import h from 'vhtml';
import type { HC } from 'vhtml';
import * as arc from '@architect/functions';

import { getPageViewsBySiteAndDate } from '../shared/ddb';
import type { PageView } from '../shared/ddb';
import { hostnameToSite, siteNameToHostname } from '../shared/util';
import { page } from './page';

interface Props {
  hostname: string;
  date: string;
  pageViews: PageView[];
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
): Promise<string> => {
  const doc = await arc.tables();
  const pageViewsPerDate = await getPageViewsBySiteAndDate(
    doc.analytics,
    site,
    owner,
    date
  );

  return page(
    <IndexPage
      hostname={siteNameToHostname(site)}
      date={date}
      pageViews={pageViewsPerDate.sort(sortPageViewsPerDate)}
    />
  );
};
