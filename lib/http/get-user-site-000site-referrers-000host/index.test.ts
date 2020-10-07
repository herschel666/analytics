import type { SubsequentAsyncHandlerEvent as AGWEvent } from '@architect/functions';

import { pageUserSiteReferrersHost } from '../../pages/page-user-site-referrers-host';
import { servePageUserSiteReferrersHost } from '.';

jest.mock('../../pages/page-user-site-referrers-host', () => ({
  pageUserSiteReferrersHost: jest.fn().mockReturnValue('some HTML...'),
}));

describe('get-user-site-000site-referrers-000host', () => {
  const site = 'site_tld';
  const host = 'some-other-site_com';
  const owner = 'some-user';

  it('should return successfully', async () => {
    const { statusCode, headers, body } = await servePageUserSiteReferrersHost(
      ({
        session: { owner },
        pathParameters: { site, host },
      } as unknown) as AGWEvent
    );
    const { ['content-type']: contentType } = headers;

    expect(statusCode).toBe(200);
    expect(contentType).toBe('text/html; charset=utf8');
    expect(body).toBe('some HTML...');
  });

  it('should call the view function', async () => {
    await servePageUserSiteReferrersHost(({
      session: { owner },
      pathParameters: { site, host },
    } as unknown) as AGWEvent);

    expect(pageUserSiteReferrersHost).toHaveBeenCalledWith(
      site,
      owner,
      'some-other-site.com'
    );
  });
});
