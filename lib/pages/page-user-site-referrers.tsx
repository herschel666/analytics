import h from 'vhtml';
import type { HC } from 'vhtml';
import * as arc from '@architect/functions';

import { getReferrersBySite } from '../shared/ddb';
import type { ReferrerHostEntry } from '../shared/ddb';
import { siteNameToHostname, hostnameToSite } from '../shared/util';
import { page } from './page';

interface Props {
  hostname: string;
  referrers: ReferrerHostEntry[];
}

const countDescending = (
  { count: a }: ReferrerHostEntry,
  { count: b }: ReferrerHostEntry
): number => {
  return a > b ? -1 : 1;
};

const detailUrl = (site: string, referrer: string): string =>
  `/user/site/${hostnameToSite(site)}/referrers/${hostnameToSite(referrer)}`;

const UserSiteReferrersPage: HC<Props> = ({ hostname, referrers }) => (
  <div>
    <h1>{hostname} — Referrers</h1>
    <a href="/user">Back</a>
    {Boolean(referrers.length) && (
      <table>
        <thead>
          <tr>
            <td>#</td>
            <th>Hostname</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {referrers.map(({ count, hostname: referrerHostname }, i) => (
            <tr>
              <td>{++i}</td>
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
  </div>
);

export const pageUserSiteReferrers = async (
  site: string,
  owner: string
): Promise<string> => {
  const doc = await arc.tables();
  const referrers = await getReferrersBySite(doc.analytics, site, owner);

  return page(
    <UserSiteReferrersPage
      referrers={referrers.sort(countDescending)}
      hostname={siteNameToHostname(site)}
    />
  );
};
