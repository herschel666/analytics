import type { Data } from '@architect/functions';

import { getReferrersBySite } from '../shared/ddb';
import { pageNotFound } from '../pages/page-not-found';
import { pageSiteReferrersDate } from '../pages/page-i-site-referrers-date';
import { handler } from './get-i-site-000site-referrers-000date';

jest.mock('../shared/ddb', () => ({
  getReferrersBySite: jest.fn().mockResolvedValue([{ type: 'referrers' }]),
}));

jest.mock('../pages/page-i-site-referrers-date', () => ({
  pageSiteReferrersDate: jest.fn().mockReturnValue('some HTML...'),
}));

jest.mock('../pages/page-not-found', () => ({
  pageNotFound: jest.fn().mockReturnValue('Wrong URL-parameter.'),
}));

describe('get-i-site-000site-referrers-000date', () => {
  const data = ({ analytics: 'analytics' } as unknown) as Data;
  const referrers = [{ type: 'referrers' }];
  const site = 'site_tld';
  const owner = 'some-user';
  const date = '2020-11';

  describe('invalid date param', () => {
    it('should respond with a 400', async () => {
      const message = 'Wrong URL-parameter.';
      const { statusCode, headers, body } = await handler({
        data,
        owner,
        site,
        date: '2020-15',
      });
      const { ['content-type']: contentType } = headers;

      expect(statusCode).toBe(400);
      expect(contentType).toBe('text/plain; charset=utf8');
      expect(body).toBe(message);
      expect(pageSiteReferrersDate).not.toHaveBeenCalled();
      expect(pageNotFound).toHaveBeenCalledWith({ message });
    });
  });

  it('should return successfully', async () => {
    const { statusCode, headers, body } = await handler({
      data,
      owner,
      site,
      date,
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
      date,
    });

    expect(getReferrersBySite).toHaveBeenCalledWith(
      data.analytics,
      site,
      owner,
      date
    );
  });

  it('should call the view function', async () => {
    await handler({
      data,
      owner,
      site,
      date,
    });

    expect(pageSiteReferrersDate).toHaveBeenCalledWith({ referrers, site });
  });
});
