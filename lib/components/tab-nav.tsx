import h from 'vhtml';
import type { HC } from 'vhtml';

export enum TabItem {
  PageViews = 'PageViews',
  Referrers = 'Referrers',
  Devices = 'Devices',
  Settings = ' Settings',
}

interface Props {
  site: string;
  current: TabItem;
}

const linkClass = (self: TabItem, current: TabItem): string =>
  `nav-link ${self === current ? ' active' : ''}`;

const ariaCurrent = (self: TabItem, current: TabItem): Record<string, string> =>
  self === current ? { 'aria-current': 'page' } : {};

const url = (site: string, suffix = ''): string =>
  `/user/site/${site}${suffix}`;

export const TabNav: HC<Props> = ({ site, current }) => (
  <ul class="nav nav-tabs mt-4">
    <li class="nav-item">
      <a
        class={linkClass(TabItem.PageViews, current)}
        href={url(site)}
        {...ariaCurrent(TabItem.PageViews, current)}
      >
        Page Views
      </a>
    </li>
    <li class="nav-item">
      <a
        class={linkClass(TabItem.Referrers, current)}
        href={url(site, '/referrers')}
        {...ariaCurrent(TabItem.Referrers, current)}
      >
        Referrers
      </a>
    </li>
    <li class="nav-item">
      <a
        class={linkClass(TabItem.Devices, current)}
        href={url(site, '/devices')}
        {...ariaCurrent(TabItem.Devices, current)}
      >
        Devices
      </a>
    </li>
    <li class="nav-item">
      <a
        class={linkClass(TabItem.Settings, current)}
        href={url(site, '/settings')}
        {...ariaCurrent(TabItem.Settings, current)}
      >
        Settings
      </a>
    </li>
  </ul>
);
