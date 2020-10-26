import h from 'vhtml';
import type { HC } from 'vhtml';

import type { PageView } from '../shared/ddb';
import { hostnameToSite, siteNameToHostname } from '../shared/util';
import { pageFrame } from '../shared/page-frame';
import { Layout } from '../components/layout';

interface Props {
  hostname: string;
  date: string;
  pageViews: PageView[];
  from?: string;
  to?: string;
}

interface Args {
  pageViews: PageView[];
  site: string;
  date: string;
  from?: string;
  to?: string;
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

const getRange = (from?: string, to?: string): string => {
  if (!from || !to) {
    return '';
  }
  return `?from=${from}&to=${to}`;
};

const Page: HC<Props> = ({ hostname, date, pageViews, from, to }) => (
  <Layout loggedIn={true} text={hostname}>
    {Boolean(pageViews.length) && (
      <div>
        <div class="my-4">
          <a href={`/i/site/${hostnameToSite(hostname)}${getRange(from, to)}`}>
            Back to overview
          </a>
        </div>
        <h2 class="mb-4">Page Views for {date}</h2>
        <table class="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Pathname</th>
              <th scope="col">Page Views</th>
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
  </Layout>
);

export const pageSiteDate = ({
  pageViews,
  site,
  date,
  from,
  to,
}: Args): string =>
  pageFrame(
    <Page
      hostname={siteNameToHostname(site)}
      date={date}
      pageViews={pageViews.sort(sortPageViewsPerDate)}
      from={from}
      to={to}
    />
  );
