import type { Data } from '@architect/functions';

import { getReferrersBySiteAndHost } from '../shared/ddb';
import { siteNameToHostname } from '../shared/util';
import { pageNotFound } from '../pages/page-not-found';
import { pageSiteReferrersHost } from '../pages/page-i-site-referrers-host';
import { handler } from './get-i-site-000site-referrers-000date-000host';

jest.mock('../shared/ddb', () => ({
  getReferrersBySiteAndHost: jest
    .fn()
    .mockResolvedValue([{ type: 'referrers-by-host' }]),
}));

jest.mock('../pages/page-i-site-referrers-host', () => ({
  pageSiteReferrersHost: jest.fn().mockReturnValue('some HTML...'),
}));

jest.mock('../pages/page-not-found', () => ({
  pageNotFound: jest.fn().mockReturnValue('not found'),
}));

describe('get-i-site-000site-referrers-000date-000host', () => {
  const data = ({ analytics: 'analytics' } as unknown) as Data;
  const referrers = [{ type: 'referrers-by-host' }];
  const site = 'site_tld';
  const host = 'some-other-site_com';
  const owner = 'some-user';

  describe('invalid date param', () => {
    const date = '2020-16';

    it('should respond with a 404', async () => {
      const { statusCode, headers, body } = await handler({
        data,
        site,
        date,
        host,
        owner,
      });
      const { ['content-type']: contentType } = headers;

      expect(statusCode).toBe(404);
      expect(contentType).toBe('text/html; charset=utf8');
      expect(body).toBe('not found');
      expect(pageSiteReferrersHost).not.toHaveBeenCalled();
      expect(pageNotFound).toHaveBeenCalled();
    });
  });

  describe('valid date param', () => {
    const date = '2020-11';

    it('should return successfully', async () => {
      const { statusCode, headers, body } = await handler({
        data,
        owner,
        site,
        date,
        host,
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
        host,
      });

      expect(getReferrersBySiteAndHost).toHaveBeenCalledWith(
        data.analytics,
        site,
        date,
        owner,
        siteNameToHostname(host)
      );
    });

    it('should call the view function', async () => {
      await handler({
        data,
        owner,
        site,
        date,
        host,
      });

      expect(pageSiteReferrersHost).toHaveBeenCalledWith({
        referrerHostname: siteNameToHostname(host),
        referrers,
        site,
      });
    });
  });
});
