import { pageSiteReferrers } from '../pages/page-i-site-referrers';
import { handler } from './get-i-site-000site-referrers';

jest.mock('../pages/page-i-site-referrers', () => ({
  pageSiteReferrers: jest.fn().mockReturnValue('some HTML...'),
}));

describe('get-i-site-000site-referrers', () => {
  const site = 'site_tld';
  const owner = 'some-user';

  it('should return successfully', async () => {
    const { statusCode, headers, body } = await handler({
      owner,
      site,
    });
    const { ['content-type']: contentType } = headers;

    expect(statusCode).toBe(200);
    expect(contentType).toBe('text/html; charset=utf8');
    expect(body).toBe('some HTML...');
  });

  it('should call the view function', async () => {
    await handler({
      owner,
      site,
    });

    expect(pageSiteReferrers).toHaveBeenCalledWith(site, owner);
  });
});
