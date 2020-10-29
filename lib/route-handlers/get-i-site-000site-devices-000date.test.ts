import type { Data } from '@architect/functions';

import { getUserAgentEntriesBySiteAndDate } from '../shared/ddb';
import { handler } from './get-i-site-000site-devices-000date';
import { pageSiteDevicesDate } from '../pages/page-i-site-devices-date';

jest.mock('../shared/ddb', () => ({
  getUserAgentEntriesBySiteAndDate: jest
    .fn()
    .mockResolvedValue({ type: 'devices' }),
}));

jest.mock('../pages/page-i-site-devices-date', () => ({
  pageSiteDevicesDate: jest.fn().mockReturnValue('some HTML...'),
}));

describe('get-i-site-000site-devices-000date', () => {
  const data = ({ analytics: 'analytics' } as unknown) as Data;
  const devices = { type: 'devices' };
  const site = 'site_tdl';
  const owner = 'somebody';

  describe('invalid date param', () => {
    it('should respond with a 404', async () => {
      const { statusCode, headers, body } = await handler({
        data,
        owner,
        site,
        date: '2020-15',
      });
      const { ['content-type']: contentType } = headers;

      expect(statusCode).toBe(404);
      expect(contentType).toBe('text/plain; charset=utf8');
      expect(body).toBe('Wrong URL-parameter.');
      expect(pageSiteDevicesDate).not.toHaveBeenCalled();
    });
  });

  describe('valid date param', () => {
    const date = '2020-09';

    it('should respond successfully', async () => {
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
      expect(pageSiteDevicesDate).toHaveBeenCalledWith({
        devices,
        site,
        date,
      });
    });

    it('should request data from the DDB', async () => {
      await handler({
        data,
        owner,
        site,
        date,
      });

      expect(getUserAgentEntriesBySiteAndDate).toHaveBeenCalledWith(
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

      expect(pageSiteDevicesDate).toHaveBeenCalledWith({
        devices,
        site,
        date,
      });
    });
  });
});
