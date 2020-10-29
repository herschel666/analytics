import type { Data, ArcQueues } from '@architect/functions';

import { handler } from './post-i-site-000site-settings';

jest.mock('../pages/page-i-site-settings', () => ({
  pageSiteSettings: jest.fn().mockReturnValue('some HTML...'),
}));

describe('post-i-site-000site-settings', () => {
  const owner = 'some-user';
  const site = 'my_awesome_site';
  const sitedata = {
    CreatedAt: new Date().toISOString(),
    Site: site,
    Owner: owner,
    Hash: '123abc',
  };
  const data = ({
    analytics: {
      delete: jest.fn(),
      get: jest.fn().mockResolvedValue(sitedata),
    },
  } as unknown) as Data;
  const queues = ({ publish: jest.fn() } as unknown) as ArcQueues;

  describe('Successful deletion', () => {
    it('should have the corect response properties', async () => {
      const {
        statusCode,
        headers: { location },
      } = await handler({
        data,
        queues,
        site,
        owner,
      });

      expect(statusCode).toBe(301);
      expect(location).toBe('/i');
    });

    it('should delete the site', async () => {
      await handler({
        data,
        queues,
        site,
        owner,
      });

      expect(data.analytics.delete).toHaveBeenCalledWith({
        PK: `SITE#${owner}#${site}`,
        SK: `SITE#${owner}#${site}`,
      });
    });

    it('should publish the delegation of the site data deletion', async () => {
      await handler({
        data,
        queues,
        site,
        owner,
      });

      expect(queues.publish).toHaveBeenCalledWith({
        name: 'delegate-site-deletion',
        payload: { site, owner },
      });
    });
  });

  describe('Failed deletion', () => {
    const errorMessage = 'Could not delete site.';
    let log: jest.SpyInstance;

    beforeAll(() => {
      log = jest.spyOn(console, 'log').mockReturnValue();
      (data.analytics.delete as jest.Mock).mockRejectedValue(errorMessage);
    });

    it('should return an erroneous response', async () => {
      const { statusCode, body } = await handler({
        queues,
        data,
        owner,
        site,
      });

      expect(statusCode).toBe(500);
      expect(body).toBe('some HTML...');
      expect(log).toHaveBeenCalledWith(errorMessage);
    });
  });
});
