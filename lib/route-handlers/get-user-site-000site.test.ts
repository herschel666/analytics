import { handler } from './get-user-site-000site';
import { pageUserSite } from '../pages/page-user-site';

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

jest.mock('../pages/page-user-site', () => ({
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
      const { statusCode, headers, body } = await handler({
        owner,
        site,
      });
      const { ['content-type']: contentType } = headers;

      expect(statusCode).toBe(200);
      expect(contentType).toBe('text/html; charset=utf8');
      expect(body).toBe('some HTML...');
    });

    it('should use the default date range', async () => {
      await handler({
        owner,
        site,
      });

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
      await handler({
        owner,
        site,
        from,
        to,
      });

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
      await handler({
        owner,
        site,
        from,
        to,
      });

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
      await handler({
        owner,
        site,
        from,
        to,
      });

      expect(pageUserSite).toHaveBeenCalledWith(
        ...baseArgs.concat([undefined])
      );
    });

    it('should ignore an empty value', async () => {
      await handler({
        owner,
        site,
        from,
        to,
      });

      expect(pageUserSite).toHaveBeenCalledWith(
        ...baseArgs.concat([undefined])
      );
    });

    it('should pass on the cursor to the view function', async () => {
      const cursor = 'some-cursor';
      await handler({
        owner,
        site,
        from,
        to,
        cursor,
      });

      expect(pageUserSite).toHaveBeenCalledWith(...baseArgs.concat([cursor]));
    });
  });
});
