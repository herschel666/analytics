import type { SubsequentAsyncHandlerEvent as AGWEvent } from '@architect/functions';

import { pageUserSiteReferrers } from '../../pages/page-user-site-referrers';
import { servePageUserSiteReferrers } from '.';

jest.mock('../../pages/page-user-site-referrers', () => ({
  pageUserSiteReferrers: jest.fn().mockReturnValue('some HTML...'),
}));

describe('get-user-site-000site-referrers', () => {
  const site = 'site_tld';
  const owner = 'some-user';

  it('should return successfully', async () => {
    const { statusCode, headers, body } = await servePageUserSiteReferrers(({
      session: { owner },
      pathParameters: { site },
    } as unknown) as AGWEvent);
    const { ['content-type']: contentType } = headers;

    expect(statusCode).toBe(200);
    expect(contentType).toBe('text/html; charset=utf8');
    expect(body).toBe('some HTML...');
  });

  it('should call the view function', async () => {
    await servePageUserSiteReferrers(({
      session: { owner },
      pathParameters: { site },
    } as unknown) as AGWEvent);

    expect(pageUserSiteReferrers).toHaveBeenCalledWith(site, owner);
  });
});
