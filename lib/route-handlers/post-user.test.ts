import type { Data } from '@architect/functions';

import { addSite } from '../shared/ddb';
import { pageUser } from '../pages/page-user';
import { handler } from './post-user';

jest.mock('../pages/page-user', () => ({
  pageUser: jest.fn().mockReturnValue('Some HTML...'),
}));

jest.mock('../shared/ddb', () => ({
  addSite: jest.fn(),
}));

describe('post-user', () => {
  const owner = 'some-user';
  const siteUrl = 'https://my.awesome.site';

  afterEach(() => {
    (addSite as jest.Mock).mockReset();
  });

  describe('no POST data given', () => {
    it('should have the corect response properties', async () => {
      const { statusCode, headers, body } = await handler({
        data: {} as Data,
        owner,
      });
      const { ['content-type']: contentType } = headers;

      expect(statusCode).toBe(200);
      expect(contentType).toBe('text/html; charset=utf8');
      expect(body).toBe('Some HTML...');
    });

    it('should call the view function', async () => {
      await handler({
        data: {} as Data,
        owner,
      });

      expect(pageUser).toHaveBeenCalledWith(owner, undefined);
    });

    it('should not try to store the site', async () => {
      await handler({
        data: {} as Data,
        owner,
      });

      expect(addSite).not.toHaveBeenCalled();
    });
  });

  describe('POST data given', () => {
    it('should have the corect response properties', async () => {
      const { statusCode, headers, body } = await handler({
        data: {} as Data,
        owner,
        siteUrl,
      });
      const { ['content-type']: contentType } = headers;

      expect(statusCode).toBe(200);
      expect(contentType).toBe('text/html; charset=utf8');
      expect(body).toBe('Some HTML...');
    });

    it('should call the view function', async () => {
      await handler({
        data: {} as Data,
        owner,
        siteUrl,
      });

      expect(pageUser).toHaveBeenCalledWith(owner, undefined);
    });

    it('should store the site', async () => {
      await handler({
        data: {} as Data,
        owner,
        siteUrl,
      });

      expect(addSite).toHaveBeenCalledWith(undefined, 'my_awesome_site', owner);
    });
  });
});
