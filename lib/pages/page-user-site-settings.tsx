import h from 'vhtml';
import type { HC } from 'vhtml';
import * as arc from '@architect/functions';

import { getSite } from '../shared/ddb';
import { siteNameToHostname } from '../shared/util';
import { page } from './page';
import { Layout } from '../components/layout/layout';
import { TabNav, TabItem } from '../components/tab-nav/tab-nav';

interface Props {
  id: string;
  site: string;
}

// TODO: use the real one
const trackingPixelUrl = 'http://localhost:3333/cctv.gif';

const UserSiteDatePage: HC<Props> = ({ id, site }) => (
  <Layout text={siteNameToHostname(site)}>
    <TabNav site={site} current={TabItem.Settings} />
    <div class="mt-4">
      <label for="tracking-code" class="form-label">
        Tracking code
      </label>
      <textarea
        id="tracking-code"
        class="form-control font-monospace"
        rows="10"
        readOnly={true}
      >{`
((pixel, trackingId, pathname, search, referrer) => {
  const src = pixel + '?' + 'id=' + trackingId + '&resource=' + encodeURIComponent(pathname + search) + '&referrer=' + encodeURIComponent(referrer);
  Object.assign(new Image(), { src });
})('${trackingPixelUrl}', '${id}', location.pathname, location.search, document.referrer);
`}</textarea>
    </div>
  </Layout>
);

export const pageUserSiteSettings = async (
  site: string,
  owner: string
): Promise<string> => {
  const doc = await arc.tables();
  const { hash: id } = await getSite(doc.analytics, site, owner);

  return page(<UserSiteDatePage id={id} site={site} />);
};
