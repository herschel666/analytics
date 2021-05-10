import type { Data } from '@architect/functions';

import { getPageViewsBySite } from '../shared/ddb';
import { handler } from './get-i-site-000site';
import { pageSite } from '../pages/page-i-site';

jest.mock('../shared/ddb', () => ({
  getPageViewsBySite: jest
    .fn()
    .mockResolvedValue({ views: [{ type: 'views' }] }),
}));

jest.mock('../shared/util.ts', () => ({
  isValidDate: jest.requireActual('../shared/util.ts').isValidDate,
  daysAgo: (days = 0) => {
    switch (days) {
      case 0:
        return '2020-02-29';
      case 7:
        return '2020-02-22';
      default:
        throw new Error('Unexpeced amount of days.');
    }
  },
}));

jest.mock('../pages/page-i-site', () => ({
  pageSite: jest.fn().mockReturnValue('some HTML...'),
}));

describe('get-i-site-000site', () => {
  const data = { analytics: 'analytics' } as unknown as Data;
  const pageViews = [{ type: 'views' }];
  const site = 'site_tld';
  const owner = 'some-user';

  describe('no query params given', () => {
    const from = '2020-02-22';
    const to = '2020-02-29';

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

    it('should call the data', async () => {
      await handler({
        data,
        site,
        owner,
      });

      expect(getPageViewsBySite).toHaveBeenCalledWith(
        data.analytics,
        site,
        owner,
        from,
        to,
        undefined
      );
    });

    it('should use the default date range', async () => {
      await handler({
        data,
        owner,
        site,
      });

      expect(pageSite).toHaveBeenCalledWith({
        pageViews,
        site,
        owner,
        from,
        to,
      });
    });
  });

  describe('date range params given', () => {
    const to = '2020-03-02';
    const from = '2020-02-12';

    it('should respect the given range', async () => {
      await handler({
        data,
        owner,
        site,
        from,
        to,
      });

      expect(pageSite).toHaveBeenCalledWith({
        pageViews,
        site,
        owner,
        from,
        to,
      });
    });

    it('should fix inverted date ranges', async () => {
      await handler({
        data,
        owner,
        site,
        from,
        to,
      });

      expect(pageSite).toHaveBeenCalledWith({
        pageViews,
        site,
        owner,
        to,
        from,
      });
    });
  });

  describe('cursor param given', () => {
    const from = '2020-02-22';
    const to = '2020-02-29';

    it('should pass on the cursor to the data function', async () => {
      const cursor = 'some-cursor';
      await handler({
        data,
        owner,
        site,
        from,
        to,
        cursor,
      });

      expect(getPageViewsBySite).toHaveBeenCalledWith(
        data.analytics,
        site,
        owner,
        from,
        to,
        cursor
      );
    });

    it('should pass on the cursor to the view function', async () => {
      const cursor = 'some-cursor';
      await handler({
        data,
        owner,
        site,
        from,
        to,
        cursor,
      });

      expect(pageSite).toHaveBeenCalledWith({
        pageViews,
        site,
        owner,
        to,
        from,
        cursor,
      });
    });

    it('should pass on a new cursor to the view function', async () => {
      (getPageViewsBySite as jest.Mock).mockResolvedValueOnce({
        views: [{ type: 'views' }],
        cursor: 'the-new-cursor',
      });
      const cursor = 'some-cursor';
      await handler({
        data,
        owner,
        site,
        from,
        to,
        cursor,
      });

      expect(pageSite).toHaveBeenCalledWith({
        newCursor: 'the-new-cursor',
        pageViews,
        site,
        owner,
        to,
        from,
        cursor,
      });
    });
  });
});
