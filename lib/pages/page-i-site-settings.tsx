import h from 'vhtml';
import type { HC } from 'vhtml';
import * as arc from '@architect/functions';

import { getSite } from '../shared/ddb';
import { siteNameToHostname } from '../shared/util';
import { pageFrame } from '../shared/page-frame';
import { Layout } from '../components/layout';
import { TabNav, TabItem } from '../components/tab-nav';

interface Props {
  id: string;
  site: string;
}

// TODO: use the real one
const trackingPixelUrl = 'http://localhost:3333/cctv.gif';

// TODO: add possibility to delete a site
// TODO: add possibility to delete the user account
const Page: HC<Props> = ({ id, site }) => (
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

export const pageSiteSettings = async (
  site: string,
  owner: string
): Promise<string> => {
  const doc = await arc.tables();
  const { hash: id } = await getSite(doc.analytics, site, owner);

  return pageFrame(<Page id={id} site={site} />);
};
