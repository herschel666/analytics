import h from 'vhtml';
import type { HC } from 'vhtml';

import type {
  UserAgentEntries,
  UABrowser,
  UAOs,
  UADevice,
} from '../shared/ddb';
import { siteNameToHostname } from '../shared/util';
import { pageFrame } from '../shared/page-frame';
import { Layout } from '../components/layout';
import { TabNav, TabItem } from '../components/tab-nav';
import { MonthNavigation } from '../components/month-navigation';
import { PieChart } from '../components/pie-chart';

interface Props {
  hostname: string;
  site: string;
  devices: UserAgentEntries;
  currentYear: number;
  currentMonth: number;
}

interface Args {
  devices: UserAgentEntries;
  site: string;
  date: string;
}

const countDescending = <T extends { count: number }>(
  { count: a }: T,
  { count: b }: T
): number => {
  return a > b ? -1 : 1;
};

const getAggregatedData = (
  data: (UABrowser | UAOs | UADevice)[]
): Record<string, number> =>
  data.reduce((acc, { name, count }) => {
    acc[name] = typeof acc[name] === 'number' ? acc[name] : 0;
    acc[name] += count;
    return acc;
  }, {});

const Page: HC<Props> = ({
  hostname,
  site,
  devices,
  currentYear,
  currentMonth,
}) => {
  const aggregatedBrowserData = getAggregatedData(devices.browsers);
  const aggregatedOsData = getAggregatedData(devices.os);
  const aggregatedDeviceData = getAggregatedData(devices.devices);

  return (
    <Layout loggedIn={true} text={hostname}>
      <TabNav site={site} current={TabItem.Devices} />
      <MonthNavigation
        site={site}
        currentYear={currentYear}
        currentMonth={currentMonth}
      />
      <div class="row">
        {devices.browsers.length > 0 && (
          <div class="col">
            <h5>Browsers</h5>
            <PieChart
              numbers={Object.values(aggregatedBrowserData)}
              labels={Object.keys(aggregatedBrowserData)}
            />
            <table class="table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Name</th>
                  <th scope="col">Version</th>
                  <th scope="col">Count</th>
                </tr>
              </thead>
              <tbody>
                {devices.browsers
                  .sort((a, b) => countDescending<UABrowser>(a, b))
                  .map(({ name, version, count }, i) => (
                    <tr>
                      <td class="text-secondary">{++i}</td>
                      <td>{name}</td>
                      <td>{version}</td>
                      <td>{count}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
        {devices.os.length > 0 && (
          <div class="col">
            <h5>OS</h5>
            <PieChart
              numbers={Object.values(aggregatedOsData)}
              labels={Object.keys(aggregatedOsData)}
            />
            <table class="table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Name</th>
                  <th scope="col">Version</th>
                  <th scope="col">Count</th>
                </tr>
              </thead>
              <tbody>
                {devices.os
                  .sort((a, b) => countDescending<UAOs>(a, b))
                  .map(({ name, version, count }, i) => (
                    <tr>
                      <td class="text-secondary">{++i}</td>
                      <td>{name}</td>
                      <td>{version}</td>
                      <td>{count}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
        {devices.devices.length > 0 && (
          <div class="col">
            <h5>Devices</h5>
            <PieChart
              numbers={Object.values(aggregatedDeviceData)}
              labels={Object.keys(aggregatedDeviceData)}
            />
            <table class="table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Type</th>
                  <th scope="col">Count</th>
                </tr>
              </thead>
              <tbody>
                {devices.devices
                  .sort((a, b) => countDescending<UADevice>(a, b))
                  .map(({ name, count }, i) => (
                    <tr>
                      <td class="text-secondary">{++i}</td>
                      <td>{name}</td>
                      <td>{count}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export const pageSiteDevicesDate = ({ devices, site, date }: Args): string => {
  const [currentYear, currentMonth] = date.split('-');

  return pageFrame(
    <Page
      devices={devices}
      hostname={siteNameToHostname(site)}
      site={site}
      currentYear={Number(currentYear)}
      currentMonth={Number(currentMonth)}
    />
  );
};
