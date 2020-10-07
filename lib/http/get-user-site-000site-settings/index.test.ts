import type { SubsequentAsyncHandlerEvent as AGWEvent } from '@architect/functions';

import { pageUserSiteSettings } from '../../pages/page-user-site-settings';
import { servePageUserSiteSettings } from '.';

jest.mock('../../pages/page-user-site-settings', () => ({
  pageUserSiteSettings: jest.fn().mockReturnValue('some HTML...'),
}));

describe('get-user-site-000site-settings', () => {
  const site = 'site_tld';
  const owner = 'some-user';

  it('should return successfully', async () => {
    const { statusCode, headers, body } = await servePageUserSiteSettings(({
      session: { owner },
      pathParameters: { site },
    } as unknown) as AGWEvent);
    const { ['content-type']: contentType } = headers;

    expect(statusCode).toBe(200);
    expect(contentType).toBe('text/html; charset=utf8');
    expect(body).toBe('some HTML...');
  });

  it('should call the view function', async () => {
    await servePageUserSiteSettings(({
      session: { owner },
      pathParameters: { site },
    } as unknown) as AGWEvent);

    expect(pageUserSiteSettings).toHaveBeenCalledWith(site, owner);
  });
});
