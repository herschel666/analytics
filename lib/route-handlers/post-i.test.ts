import type { Data } from '@architect/functions';

import { addSite } from '../shared/ddb';
import { handler } from './post-i';
import { handler as getHandler } from './get-i';

jest.mock('./get-i', () => ({
  handler: jest.fn().mockReturnValue({ statusCode: 200, body: 'Some HTML...' }),
}));

jest.mock('../shared/ddb', () => ({
  addSite: jest.fn(),
}));

describe('post-i', () => {
  const owner = 'some-user';
  const siteUrl = 'https://my.awesome.site';

  describe('no POST data given', () => {
    it('should have the corect response properties', async () => {
      const { statusCode, body } = await handler({
        data: {} as Data,
        owner,
      });

      expect(statusCode).toBe(200);
      expect(body).toBe('Some HTML...');
    });

    it('should call the GET-handler', async () => {
      await handler({
        data: {} as Data,
        owner,
      });

      expect(getHandler).toHaveBeenCalledWith({
        data: {} as Data,
        debug: undefined,
        owner,
      });
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
      const { statusCode, body } = await handler({
        data: {} as Data,
        owner,
        siteUrl,
      });

      expect(statusCode).toBe(200);
      expect(body).toBe('Some HTML...');
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

  describe('debug-param given', () => {
    it('should pass on debug-param to the GET-handler', async () => {
      const debug = 'SITES';

      await handler({
        data: {} as Data,
        debug,
        owner,
      });

      expect(getHandler).toHaveBeenCalledWith({
        data: {} as Data,
        debug,
        owner,
      });
    });
  });
});
