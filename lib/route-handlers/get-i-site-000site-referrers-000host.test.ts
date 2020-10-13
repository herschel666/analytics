import { pageSiteReferrersHost } from '../pages/page-i-site-referrers-host';
import { handler } from './get-i-site-000site-referrers-000host';

jest.mock('../pages/page-i-site-referrers-host', () => ({
  pageSiteReferrersHost: jest.fn().mockReturnValue('some HTML...'),
}));

describe('get-i-site-000site-referrers-000host', () => {
  const site = 'site_tld';
  const host = 'some-other-site_com';
  const owner = 'some-user';

  it('should return successfully', async () => {
    const { statusCode, headers, body } = await handler({
      owner,
      site,
      host,
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
      host,
    });

    expect(pageSiteReferrersHost).toHaveBeenCalledWith(
      site,
      owner,
      'some-other-site.com'
    );
  });
});
