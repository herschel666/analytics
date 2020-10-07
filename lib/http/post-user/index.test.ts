import type { SubsequentAsyncHandlerEvent as AGWEvent } from '@architect/functions';

import { btoa } from '../../shared/util';
import { addSite } from '../../shared/ddb';
import { pageUser } from '../../pages/page-user';
import { servePageUser } from '.';

jest.mock('../../pages/page-user', () => ({
  pageUser: jest.fn().mockReturnValue('Some HTML...'),
}));

jest.mock('../../shared/ddb', () => ({
  addSite: jest.fn(),
}));

jest.mock('@architect/functions', () => ({
  ...jest.requireActual('@architect/functions'),
  tables: jest.fn().mockResolvedValue({}),
}));

describe('post-user', () => {
  const owner = 'some-user';
  const site_url = 'https://my.awesome.site';
  const requestHeaders = {
    'content-type': 'application/json',
  };
  const requestBody = btoa(JSON.stringify({ site_url }));
  const baseRequest = {
    headers: requestHeaders,
    isBase64Encoded: true,
  };
  const invalidRequest = { ...baseRequest, body: '' };
  const validRequest = { ...baseRequest, body: requestBody };

  afterEach(() => {
    (addSite as jest.Mock).mockReset();
  });

  describe('no POST data given', () => {
    it('should have the corect response properties', async () => {
      const { statusCode, headers, body } = await servePageUser(({
        ...invalidRequest,
        session: { owner },
      } as unknown) as AGWEvent);
      const { ['content-type']: contentType } = headers;

      expect(statusCode).toBe(200);
      expect(contentType).toBe('text/html; charset=utf8');
      expect(body).toBe('Some HTML...');
    });

    it('should call the view function', async () => {
      await servePageUser(({
        ...invalidRequest,
        session: { owner },
      } as unknown) as AGWEvent);

      expect(pageUser).toHaveBeenCalledWith(owner, undefined);
    });

    it('should not try to store the site', async () => {
      await servePageUser(({
        ...invalidRequest,
        session: { owner },
      } as unknown) as AGWEvent);

      expect(addSite).not.toHaveBeenCalled();
    });
  });

  describe('POST data given', () => {
    it('should have the corect response properties', async () => {
      const { statusCode, headers, body } = await servePageUser(({
        ...validRequest,
        session: { owner },
      } as unknown) as AGWEvent);
      const { ['content-type']: contentType } = headers;

      expect(statusCode).toBe(200);
      expect(contentType).toBe('text/html; charset=utf8');
      expect(body).toBe('Some HTML...');
    });

    it('should call the view function', async () => {
      await servePageUser(({
        ...validRequest,
        session: { owner },
      } as unknown) as AGWEvent);

      expect(pageUser).toHaveBeenCalledWith(owner, undefined);
    });

    it('should store the site', async () => {
      await servePageUser(({
        ...validRequest,
        session: { owner },
      } as unknown) as AGWEvent);

      expect(addSite).toHaveBeenCalledWith(undefined, 'my_awesome_site', owner);
    });
  });
});
