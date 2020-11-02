import type { Data } from '@architect/functions';

import { decrypt } from '../shared/crypto';
import { addPageView } from '../shared/ddb';
import { handler } from './get-cctv_gif';

jest.mock('../shared/ddb', () => ({
  addPageView: jest.fn(),
}));

jest.mock('../shared/crypto', () => ({
  decrypt: jest.fn(),
}));

describe('get-cctv_gif', () => {
  const id = 'some-encrypted-gibberish';
  const resource = '/some/page';
  const referrer = 'https://some-other-site.tld/';
  const log = console.log;
  const userAgentString =
    'Mozilla/5.0 (compatible; MSIE 7.0; Windows NT 6.0; Trident/3.1)';
  const unknownUserAgent = {
    browserName: 'unknown',
    browserVersion: 'unknown',
    osName: 'unknown',
    osVersion: 'unknown',
    device: 'unknown',
  };

  beforeAll(() => {
    console.log = () => void 0;
  });

  afterAll(() => {
    console.log = log;
  });

  describe('query params completely missing', () => {
    const args = { data: {} as Data, headers: {} };

    it('should always respond with 200', async () => {
      const {
        statusCode,
        body,
        headers: { ['content-type']: contentType },
      } = await handler(args);

      expect(statusCode).toBe(200);
      expect(
        Buffer.from(body, 'base64').toString('utf8').startsWith('GIF89')
      ).toBe(true);
      expect(contentType).toBe('image/gif');
    });

    it('should handle referrer "undefined" gracefully', async () => {
      const { statusCode } = await handler({ ...args, referrer: 'undefined' });

      expect(statusCode).toBe(200);
    });

    it('should not try to store a page view if ID & Resource are missing', async () => {
      await handler(args);

      expect(addPageView).not.toHaveBeenCalled();
    });
  });

  describe('query params only containig ID', () => {
    const args = {
      data: {} as Data,
      headers: {},
      id,
    };

    beforeEach(() => {
      (decrypt as jest.Mock).mockReturnValue('user-sdg#site-fzxhg.tld');
    });

    it('should not try to store a page view if Resource is missing', async () => {
      await handler(args);

      expect(decrypt).toHaveBeenCalledWith(args.id);
    });
  });

  describe('query params only containig Resource', () => {
    const args = { resource: '/some/page', data: {} as Data, headers: {} };

    it('should not try to store a page view if Resource is missing', async () => {
      await handler(args);

      expect(addPageView).not.toHaveBeenCalled();
    });
  });

  describe('Decrypting the ID causes an error', () => {
    const args = {
      data: {} as Data,
      headers: {},
      resource,
      id,
    };

    beforeEach(() => {
      (decrypt as jest.Mock).mockImplementationOnce(() => {
        throw new Error('could not decrypt ID');
      });
    });

    it('should return successfully nonetheless', async () => {
      const { statusCode } = await handler(args);

      expect(statusCode).toBe(200);
    });
  });

  describe('Adding page view causes an error', () => {
    const args = {
      data: {} as Data,
      headers: {},
      resource,
      id,
    };

    beforeEach(() => {
      (decrypt as jest.Mock).mockReturnValue('user-rwsx#site-khvj.tld');
      (addPageView as jest.Mock).mockRejectedValueOnce(
        'could not store page view'
      );
    });

    it('should return successfully nonetheless', async () => {
      const { statusCode } = await handler(args);

      expect(statusCode).toBe(200);
    });
  });

  describe('Adding minimal page view data', () => {
    const args = {
      data: {} as Data,
      headers: {},
      resource,
      id,
    };

    beforeEach(() => {
      (decrypt as jest.Mock).mockReturnValue('user-123#site-1.tld');
    });

    it('should store Resource', async () => {
      await handler(args);

      expect(addPageView).toHaveBeenCalledWith(
        expect.any(Object),
        'site-1_tld',
        'user-123',
        resource,
        unknownUserAgent,
        undefined
      );
    });
  });

  describe('Adding page view & referrer', () => {
    const args = {
      data: {} as Data,
      headers: {},
      referrer,
      resource,
      id,
    };

    beforeEach(() => {
      (decrypt as jest.Mock).mockReturnValue('user-456#site-2.tld');
    });

    it('should store Resource & Referrer', async () => {
      await handler(args);

      expect(addPageView).toHaveBeenCalledWith(
        expect.any(Object),
        'site-2_tld',
        'user-456',
        resource,
        unknownUserAgent,
        referrer
      );
    });
  });

  describe('Adding complete page view', () => {
    const args = {
      data: {} as Data,
      headers: { 'user-agent': userAgentString },
      referrer,
      resource,
      id,
    };

    beforeEach(() => {
      (decrypt as jest.Mock).mockReturnValue('user-789#site-3.tld');
    });

    it('should store Resource, User Agent & Referrer', async () => {
      const userAgent = {
        browserName: 'IE',
        browserVersion: '7',
        device: 'unknown',
        osName: 'Windows',
        osVersion: 'Vista',
      };
      await handler(args);

      expect(addPageView).toHaveBeenCalledWith(
        expect.any(Object),
        'site-3_tld',
        'user-789',
        resource,
        userAgent,
        referrer
      );
    });
  });
});
