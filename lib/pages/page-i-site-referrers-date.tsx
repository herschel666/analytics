import h from 'vhtml';
import type { HC } from 'vhtml';

import type { ReferrerHostEntry } from '../shared/ddb';
import { siteNameToHostname, hostnameToSite } from '../shared/util';
import { pageFrame } from '../shared/page-frame';
import { Layout } from '../components/layout';
import { TabNav, TabItem } from '../components/tab-nav';
import { MonthNavigation } from '../components/month-navigation';

interface Props {
  site: string;
  referrers: ReferrerHostEntry[];
  currentYear: number;
  currentMonth: number;
}

interface Args {
  referrers: ReferrerHostEntry[];
  site: string;
  date: string;
}

const countDescending = (
  { count: a }: ReferrerHostEntry,
  { count: b }: ReferrerHostEntry
): number => {
  return a > b ? -1 : 1;
};

const detailUrl = (site: string, referrer: string): string =>
  `/i/site/${hostnameToSite(site)}/referrers/host/${hostnameToSite(referrer)}`;

const Page: HC<Props> = ({ site, referrers, currentYear, currentMonth }) => {
  const hostname = siteNameToHostname(site);

  return (
    <Layout loggedIn={true} text={hostname}>
      <TabNav site={site} current={TabItem.Referrers} />
      <MonthNavigation
        type="referrers"
        site={site}
        currentYear={currentYear}
        currentMonth={currentMonth}
      />
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

export const pageSiteReferrersDate = ({
  referrers,
  site,
  date,
}: Args): string => {
  const [currentYear, currentMonth] = date.split('-');

  return pageFrame(
    <Page
      referrers={referrers.sort(countDescending)}
      site={site}
      currentYear={Number(currentYear)}
      currentMonth={Number(currentMonth)}
    />
  );
};
