import h from 'vhtml';
import type { HC } from 'vhtml';
import * as arc from '@architect/functions';

import { getReferrersBySiteAndHost } from '../shared/ddb';
import type { ReferrerEntry } from '../shared/ddb';
import { hostnameToSite, siteNameToHostname } from '../shared/util';
import { page } from './page';

interface Props {
  hostname: string;
  referrerHostname: string;
  referrers: ReferrerEntry[];
}

const countDescending = (
  { count: a }: ReferrerEntry,
  { count: b }: ReferrerEntry
): number => {
  return a > b ? -1 : 1;
};

const UserSiteReferrersHostPage: HC<Props> = ({
  hostname,
  referrerHostname,
  referrers,
}) => (
  <div>
    <h1>
      {hostname} — Referrers for {referrerHostname}
    </h1>
    <a href={`/user/site/${hostnameToSite(hostname)}/referrers`}>Back</a>
    {Boolean(referrers.length) && (
      <table>
        <thead>
          <tr>
            <td>#</td>
            <th>Pathname</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {referrers.map(({ count, pathname }, i) => (
            <tr>
              <td>{++i}</td>
              <td>{pathname}</td>
              <td>{count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

export const pageUserSiteReferrersHost = async (
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

  return page(
    <UserSiteReferrersHostPage
      referrers={referrers.sort(countDescending)}
      hostname={siteNameToHostname(site)}
      referrerHostname={host}
    />
  );
};
