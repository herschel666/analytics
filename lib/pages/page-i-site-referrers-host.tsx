import h from 'vhtml';
import type { HC } from 'vhtml';
import * as arc from '@architect/functions';

import { getReferrersBySiteAndHost } from '../shared/ddb';
import type { ReferrerEntry } from '../shared/ddb';
import { siteNameToHostname } from '../shared/util';
import { pageFrame } from './frame';
import { Layout } from '../components/layout';
import { TabNav, TabItem } from '../components/tab-nav';

interface Props {
  site: string;
  referrerHostname: string;
  referrers: ReferrerEntry[];
}

const countDescending = (
  { count: a }: ReferrerEntry,
  { count: b }: ReferrerEntry
): number => {
  return a > b ? -1 : 1;
};

const Page: HC<Props> = ({ site, referrerHostname, referrers }) => (
  <Layout text={siteNameToHostname(site)}>
    <TabNav site={site} current={TabItem.Referrers} />
    <h2 class="my-4">
      Referrers for <strong class="text-secondary">{referrerHostname}</strong>
    </h2>
    {Boolean(referrers.length) && (
      <table class="table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Pathname</th>
            <th scope="col">Count</th>
          </tr>
        </thead>
        <tbody>
          {referrers.map(({ count, pathname }, i) => (
            <tr>
              <td class="text-secondary">{++i}</td>
              <td>{pathname}</td>
              <td>{count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </Layout>
);

export const pageSiteReferrersHost = async (
  site: string,
  owner: string,
  host: string
): Promise<string> => {
  const doc = await arc.tables();
  const referrers = await getReferrersBySiteAndHost(
    doc.analytics,
    site,
    owner,
    host
  );

  return pageFrame(
    <Page
      referrers={referrers.sort(countDescending)}
      site={site}
      referrerHostname={host}
    />
  );
};
