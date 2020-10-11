import { handler } from './get-user-site-000site-date-000date';
import { pageUserSiteDate } from '../pages/page-user-site-date';
import { btoa } from '../shared/util';

jest.mock('../pages/page-user-site-date', () => ({
  pageUserSiteDate: jest.fn().mockReturnValue('some HTML...'),
}));

describe('get-user-site-000site-date-000date', () => {
  const site = 'site_tld';
  const date = '2020-05-10';
  const owner = 'some-user';

  afterEach(() => {
    (pageUserSiteDate as jest.Mock).mockReset();
  });

  describe('no query params given', () => {
    it('should return successfully', async () => {
      const { statusCode, headers, body } = await handler({
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

    it('should ignore the missing date range', async () => {
      await handler({
        range: '',
        owner,
        site,
        date,
      });

      expect(pageUserSiteDate).toHaveBeenCalledWith(
        site,
        owner,
        date,
        undefined,
        undefined
      );
    });
  });

  describe('date range param given', () => {
    describe('invalid date range string', () => {
      it('should ignore the invalid date range', async () => {
        const range = 'this-is-not-a-valid-base-64';
        await handler({
          owner,
          site,
          date,
          range,
        });

        expect(pageUserSiteDate).toHaveBeenCalledWith(
          site,
          owner,
          date,
          undefined,
          undefined
        );
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
          owner,
          site,
          date,
          range,
        });

        expect(pageUserSiteDate).toHaveBeenCalledWith(
          site,
          owner,
          date,
          undefined,
          undefined
        );
      });
    });

    describe('valid date range values', () => {
      it('should respect the given range', async () => {
        const from = '2020-02-12';
        const to = '2020-03-02';
        const range = encodeURIComponent(btoa(JSON.stringify({ from, to })));
        await handler({
          owner,
          site,
          date,
          range,
        });

        expect(pageUserSiteDate).toHaveBeenCalledWith(
          site,
          owner,
          date,
          from,
          to
        );
      });
    });
  });
});
