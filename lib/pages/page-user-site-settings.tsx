import h from 'vhtml';
import type { HC } from 'vhtml';
import * as arc from '@architect/functions';

import { getSite } from '../shared/ddb';
import { hostnameToSite, siteNameToHostname } from '../shared/util';
import { page } from './page';

interface Props {
  id: string;
  hostname: string;
}

// TODO: use the real one
const trackingPixelUrl = 'http://localhost:3333/cctv.gif';

const UserSiteDatePage: HC<Props> = ({ id, hostname }) => (
  <div>
    <h1>{hostname} — Settings</h1>
    <div>
      <a href={`/user/site/${hostnameToSite(hostname)}`}>Back</a>
      <div>
        <label for="tracking-code">Tracking code</label>
        <textarea id="tracking-code" class="w-full">{`
((pixel, trackingId, pathname, search, referrer) => {
  const src = pixel + '?' + 'id=' + trackingId + '&resource=' + encodeURIComponent(pathname + search) + '&referrer=' + encodeURIComponent(referrer);
  Object.assign(new Image(), { src });
})('${trackingPixelUrl}', '${id}', location.pathname, location.search, document.referrer);
`}</textarea>
      </div>
    </div>
  </div>
);

export const pageUserSiteSettings = async (
  site: string,
  owner: string
): Promise<string> => {
  const doc = await arc.tables();
  const { hash: id } = await getSite(doc.analytics, site, owner);

  return page(<UserSiteDatePage id={id} hostname={siteNameToHostname(site)} />);
};
