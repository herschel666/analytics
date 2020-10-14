import type { Data } from '@architect/functions';

import { getSite } from '../shared/ddb';
import { pageSiteSettings } from '../pages/page-i-site-settings';
import { handler } from './get-i-site-000site-settings';

jest.mock('../shared/ddb', () => ({
  getSite: jest.fn().mockResolvedValue({ hash: 'the-site-id' }),
}));

jest.mock('../pages/page-i-site-settings', () => ({
  pageSiteSettings: jest.fn().mockReturnValue('some HTML...'),
}));

describe('get-i-site-000site-settings', () => {
  const data = ({ analytics: 'analytics' } as unknown) as Data;
  const site = 'site_tld';
  const owner = 'some-user';

  it('should return successfully', async () => {
    const { statusCode, headers, body } = await handler({
      data,
      owner,
      site,
    });
    const { ['content-type']: contentType } = headers;

    expect(statusCode).toBe(200);
    expect(contentType).toBe('text/html; charset=utf8');
    expect(body).toBe('some HTML...');
  });

  it('should request data from the DDB', async () => {
    await handler({
      data,
      owner,
      site,
    });

    expect(getSite).toHaveBeenCalledWith(data.analytics, site, owner);
  });

  it('should call the view function', async () => {
    await handler({
      data,
      owner,
      site,
    });

    expect(pageSiteSettings).toHaveBeenCalledWith({ id: 'the-site-id', site });
  });
});
