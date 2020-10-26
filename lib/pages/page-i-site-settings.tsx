import h from 'vhtml';
import type { HC } from 'vhtml';

import { siteNameToHostname } from '../shared/util';
import { pageFrame } from '../shared/page-frame';
import { Layout } from '../components/layout';
import { TabNav, TabItem } from '../components/tab-nav';

interface Props {
  id: string;
  site: string;
  error?: boolean;
}

// TODO: use the real one
const trackingPixelUrl = 'http://localhost:3333/cctv.gif';

// TODO: add possibility to delete the user account
const Page: HC<Props> = ({ id, site, error }) => (
  <Layout loggedIn={true} text={siteNameToHostname(site)}>
    <TabNav site={site} current={TabItem.Settings} />
    <div class="mt-4">
      <h3>Tracking Code</h3>
      <label for="tracking-code" class="form-label">
        Insert this code into the source of {siteNameToHostname(site)}
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
    <hr />
    <div class="mt-4">
      <h3>Danger Zone</h3>
      <p>Once you delete a site, there is no going back. Please be certain.</p>
      {Boolean(error) && (
        <div class="alert alert-danger" role="alert">
          Could not delete site!
        </div>
      )}
      <form method="post" action={`/i/site/${site}/settings`}>
        <button
          class="btn btn-danger"
          type="button"
          id="delete-site"
          data-hostname={siteNameToHostname(site)}
        >
          Delete site
        </button>
      </form>
    </div>
  </Layout>
);

export const pageSiteSettings = ({ site, id, error }: Props): string =>
  pageFrame(<Page id={id} site={site} error={error} />);
