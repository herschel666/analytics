import { handler } from './get-user-site-000site-devices-000date';
import { pageUserSiteDevicesDate } from '../pages/page-user-site-devices-date';

jest.mock('../pages/page-user-site-devices-date', () => ({
  pageUserSiteDevicesDate: jest.fn().mockReturnValue('some HTML...'),
}));

describe('get-user-site-000site-devices-000date', () => {
  const site = 'site_tdl';
  const owner = 'somebody';

  describe('invalid date param', () => {
    it('should respond with a 404', async () => {
      const { statusCode, headers, body } = await handler({
        owner,
        site,
        date: '2020-15',
      });
      const { ['content-type']: contentType } = headers;

      expect(statusCode).toBe(404);
      expect(contentType).toBe('text/plain; charset=utf8');
      expect(body).toBe('Wrong URL-parameter.');
      expect(pageUserSiteDevicesDate).not.toHaveBeenCalled();
    });
  });

  describe('valid date param', () => {
    it('should respond successfully', async () => {
      const date = '2020-09';
      const { statusCode, headers, body } = await handler({
        owner,
        site,
        date,
      });
      const { ['content-type']: contentType } = headers;

      expect(statusCode).toBe(200);
      expect(contentType).toBe('text/html; charset=utf8');
      expect(body).toBe('some HTML...');
      expect(pageUserSiteDevicesDate).toHaveBeenCalledWith(site, owner, date);
    });
  });
});
