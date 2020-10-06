import type { SubsequentAsyncHandlerEvent as AGWEvent } from '@architect/functions';

import { servePageUserSite } from '.';
import { pageUserSite } from '../../pages/page-user-site';

jest.mock('../../shared/util.ts', () => ({
  isValidDate: jest.requireActual('../../shared/util.ts').isValidDate,
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

jest.mock('../../pages/page-user-site', () => ({
  pageUserSite: jest.fn().mockReturnValue('some HTML...'),
}));

describe('get-user-site-000site', () => {
  const site = 'site_tld';
  const owner = 'some-user';

  afterEach(() => {
    (pageUserSite as jest.Mock).mockReset();
  });

  describe('no query params given', () => {
    it('should return successfully', async () => {
      const { statusCode, headers, body } = await servePageUserSite(({
        session: { owner },
        pathParameters: { site },
      } as unknown) as AGWEvent);
      const { ['content-type']: contentType } = headers;

      expect(statusCode).toBe(200);
      expect(contentType).toBe('text/html; charset=utf8');
      expect(body).toBe('some HTML...');
    });

    it('should use the default date range', async () => {
      await servePageUserSite(({
        session: { owner },
        pathParameters: { site },
      } as unknown) as AGWEvent);

      expect(pageUserSite).toHaveBeenCalledWith(
        site,
        owner,
        '2020-02-22',
        '2020-02-29',
        undefined
      );
    });
  });

  describe('date range params given', () => {
    it('should respect the given range', async () => {
      const to = '2020-03-02';
      const from = '2020-02-12';
      await servePageUserSite(({
        session: { owner },
        pathParameters: { site },
        queryStringParameters: { from, to },
      } as unknown) as AGWEvent);

      expect(pageUserSite).toHaveBeenCalledWith(
        site,
        owner,
        from,
        to,
        undefined
      );
    });

    it('should fix inverted date ranges', async () => {
      const from = '2020-03-02';
      const to = '2020-02-12';
      await servePageUserSite(({
        session: { owner },
        pathParameters: { site },
        queryStringParameters: { from, to },
      } as unknown) as AGWEvent);

      expect(pageUserSite).toHaveBeenCalledWith(
        site,
        owner,
        to,
        from,
        undefined
      );
    });
  });

  describe('cursor param given', () => {
    const from = '2020-02-22';
    const to = '2020-02-29';
    const baseArgs = [site, owner, from, to];

    it('should ignore an undefined value', async () => {
      await servePageUserSite(({
        session: { owner },
        pathParameters: { site },
        queryStringParameters: { from, to, cursor: undefined },
      } as unknown) as AGWEvent);

      expect(pageUserSite).toHaveBeenCalledWith(
        ...baseArgs.concat([undefined])
      );
    });

    it('should ignore an empty value', async () => {
      await servePageUserSite(({
        session: { owner },
        pathParameters: { site },
        queryStringParameters: { from, to, cursor: undefined },
      } as unknown) as AGWEvent);

      expect(pageUserSite).toHaveBeenCalledWith(
        ...baseArgs.concat([undefined])
      );
    });

    it('should pass on the cursor to the view function', async () => {
      const cursor = 'some-cursor';
      await servePageUserSite(({
        session: { owner },
        pathParameters: { site },
        queryStringParameters: { from, to, cursor },
      } as unknown) as AGWEvent);

      expect(pageUserSite).toHaveBeenCalledWith(...baseArgs.concat([cursor]));
    });
  });
});
