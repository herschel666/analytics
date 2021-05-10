import type { Data } from '@architect/functions';

import { getPageViewsBySiteAndDate } from '../shared/ddb';
import { handler } from './get-i-site-000site-date-000date';
import { pageSiteDate } from '../pages/page-i-site-date';
import { btoa } from '../shared/util';

jest.mock('../shared/ddb', () => ({
  getPageViewsBySiteAndDate: jest.fn().mockResolvedValue([{ type: 'views' }]),
}));

jest.mock('../pages/page-i-site-date', () => ({
  pageSiteDate: jest.fn().mockReturnValue('some HTML...'),
}));

describe('get-i-site-000site-date-000date', () => {
  const data = { analytics: 'analytics' } as unknown as Data;
  const pageViews = [{ type: 'views' }];
  const site = 'site_tld';
  const date = '2020-05-10';
  const owner = 'some-user';

  describe('no query params given', () => {
    it('should return successfully', async () => {
      const { statusCode, headers, body } = await handler({
        data,
        range: '',
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
        range: '',
        owner,
        site,
        date,
      });

      expect(getPageViewsBySiteAndDate).toHaveBeenCalledWith(
        data.analytics,
        site,
        owner,
        date
      );
    });

    it('should ignore the missing date range', async () => {
      await handler({
        data,
        range: '',
        owner,
        site,
        date,
      });

      expect(pageSiteDate).toHaveBeenCalledWith({
        pageViews,
        site,
        date,
      });
    });
  });

  describe('date range param given', () => {
    describe('invalid date range string', () => {
      it('should ignore the invalid date range', async () => {
        const range = 'this-is-not-a-valid-base-64';
        await handler({
          data,
          owner,
          site,
          date,
          range,
        });

        expect(pageSiteDate).toHaveBeenCalledWith({
          pageViews,
          site,
          date,
        });
      });
    });

    describe('invalid date range values', () => {
      it('should ignore the invalid date range values', async () => {
        const range = encodeURIComponent(
          btoa(
            JSON.stringify({
              from: 'nonsense',
              to: 'bullshit',
            })
          )
        );
        await handler({
          data,
          owner,
          site,
          date,
          range,
        });

        expect(pageSiteDate).toHaveBeenCalledWith({
          pageViews,
          site,
          date,
        });
      });
    });

    describe('valid date range values', () => {
      it('should respect the given range', async () => {
        const from = '2020-02-12';
        const to = '2020-03-02';
        const range = encodeURIComponent(btoa(JSON.stringify({ from, to })));
        await handler({
          data,
          owner,
          site,
          date,
          range,
        });

        expect(pageSiteDate).toHaveBeenCalledWith({
          pageViews,
          site,
          date,
          from,
          to,
        });
      });
    });
  });
});
