import h from 'vhtml';
import type { HC } from 'vhtml';
import * as arc from '@architect/functions';

import { getUserAgentEntriesBySiteAndDate } from '../shared/ddb';
import type {
  UserAgentEntries,
  UABrowser,
  UAOs,
  UADevice,
} from '../shared/ddb';
import { siteNameToHostname } from '../shared/util';
import { page } from './page';

interface Props {
  hostname: string;
  site: string;
  devices: UserAgentEntries;
  date: string;
  months: string[];
}

const padLeft = (i: number): string => `0${i}`.slice(-2);

const countDescending = <T extends { count: number }>(
  { count: a }: T,
  { count: b }: T
): number => {
  return a > b ? -1 : 1;
};

const getLastYearsMonths = (lastYear: number): string[] => {
  const months = Array.from({ length: 12 }, (_: undefined, i: number) =>
    padLeft(i + 1)
  );
  return months.map((month) => `${lastYear}-${month}`);
};

const getThisYearsMonths = (date: string): string[] => {
  const [year, monthString] = date.split('-');
  const previousMonths = Array.from(
    { length: Number(monthString) },
    (_: undefined, i: number) => padLeft(i + 1)
  );
  return previousMonths.map((month) => `${year}-${month}`);
};

const UserSiteDevicesDatePage: HC<Props> = ({
  hostname,
  site,
  devices,
  date,
  months,
}) => (
  <div>
    <h1>
      {hostname} — Devices for {date}
    </h1>
    <a href="/user">Back</a>
    <ul>
      {months.map((month) => (
        <li>
          <a href={`/user/site/${site}/devices/${month}`}>{month}</a>
        </li>
      ))}
    </ul>
    {devices.browsers.length > 0 && (
      <table>
        <caption>Browsers</caption>
        <thead>
          <tr>
            <td>#</td>
            <th>Name</th>
            <th>Version</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {devices.browsers
            .sort((a, b) => countDescending<UABrowser>(a, b))
            .map(({ name, version, count }, i) => (
              <tr>
                <td>{++i}</td>
                <td>{name}</td>
                <td>{version}</td>
                <td>{count}</td>
              </tr>
            ))}
        </tbody>
      </table>
    )}
    {devices.os.length > 0 && (
      <table>
        <caption>OS</caption>
        <thead>
          <tr>
            <td>#</td>
            <th>Name</th>
            <th>Version</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {devices.os
            .sort((a, b) => countDescending<UAOs>(a, b))
            .map(({ name, version, count }, i) => (
              <tr>
                <td>{++i}</td>
                <td>{name}</td>
                <td>{version}</td>
                <td>{count}</td>
              </tr>
            ))}
        </tbody>
      </table>
    )}
    {devices.devices.length > 0 && (
      <table>
        <caption>Devices</caption>
        <thead>
          <tr>
            <td>#</td>
            <th>Type</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {devices.devices
            .sort((a, b) => countDescending<UADevice>(a, b))
            .map(({ type, count }, i) => (
              <tr>
                <td>{++i}</td>
                <td>{type}</td>
                <td>{count}</td>
              </tr>
            ))}
        </tbody>
      </table>
    )}
  </div>
);

export const pageUserSiteDevicesDate = async (
  site: string,
  owner: string,
  date: string
): Promise<string> => {
  const doc = await arc.tables();
  const devices = await getUserAgentEntriesBySiteAndDate(
    doc.analytics,
    site,
    owner,
    date
  );
  const currentDate = new Date()
    .toISOString()
    .split('T')
    .shift()
    .split('-')
    .slice(0, 2)
    .join('-');
  const lastYearsMonths = getLastYearsMonths(
    Number(currentDate.split('-').shift()) - 1
  );
  const months = [...lastYearsMonths, ...getThisYearsMonths(currentDate)];

  return page(
    <UserSiteDevicesDatePage
      devices={devices}
      hostname={siteNameToHostname(site)}
      site={site}
      date={date}
      months={months}
    />
  );
};
