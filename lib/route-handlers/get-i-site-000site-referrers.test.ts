import type { Data } from '@architect/functions';

import { getReferrersBySite } from '../shared/ddb';
import { pageSiteReferrers } from '../pages/page-i-site-referrers';
import { handler } from './get-i-site-000site-referrers';

jest.mock('../shared/ddb', () => ({
  getReferrersBySite: jest.fn().mockResolvedValue([{ type: 'referrers' }]),
}));

jest.mock('../pages/page-i-site-referrers', () => ({
  pageSiteReferrers: jest.fn().mockReturnValue('some HTML...'),
}));

afterEach(() => {
  (getReferrersBySite as jest.Mock).mockClear();
});

describe('get-i-site-000site-referrers', () => {
  const data = ({ analytics: 'analytics' } as unknown) as Data;
  const referrers = [{ type: 'referrers' }];
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

    expect(getReferrersBySite).toHaveBeenCalledWith(
      data.analytics,
      site,
      owner
    );
  });

  it('should call the view function', async () => {
    await handler({
      data,
      owner,
      site,
    });

    expect(pageSiteReferrers).toHaveBeenCalledWith({ referrers, site });
  });
});
