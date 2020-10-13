import h from 'vhtml';
import type { HC } from 'vhtml';
import * as arc from '@architect/functions';

import { getReferrersBySite } from '../shared/ddb';
import type { ReferrerHostEntry } from '../shared/ddb';
import { siteNameToHostname, hostnameToSite } from '../shared/util';
import { pageFrame } from './frame';
import { Layout } from '../components/layout';
import { TabNav, TabItem } from '../components/tab-nav';

interface Props {
  site: string;
  referrers: ReferrerHostEntry[];
}

const countDescending = (
  { count: a }: ReferrerHostEntry,
  { count: b }: ReferrerHostEntry
): number => {
  return a > b ? -1 : 1;
};

const detailUrl = (site: string, referrer: string): string =>
  `/i/site/${hostnameToSite(site)}/referrers/${hostnameToSite(referrer)}`;

const Page: HC<Props> = ({ site, referrers }) => {
  const hostname = siteNameToHostname(site);

  return (
    <Layout text={hostname}>
      <TabNav site={site} current={TabItem.Referrers} />
      {Boolean(referrers.length) && (
        <table class="table mt-4">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Hostname</th>
              <th scope="col">Count</th>
            </tr>
          </thead>
          <tbody>
            {referrers.map(({ count, hostname: referrerHostname }, i) => (
              <tr>
                <td class="text-secondary">{++i}</td>
                <td>
                  <a href={detailUrl(hostname, referrerHostname)}>
                    {referrerHostname}
                  </a>
                </td>
                <td>{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
};

export const pageSiteReferrers = async (
  site: string,
  owner: string
): Promise<string> => {
  const doc = await arc.tables();
  const referrers = await getReferrersBySite(doc.analytics, site, owner);

  return pageFrame(
    <Page referrers={referrers.sort(countDescending)} site={site} />
  );
};
