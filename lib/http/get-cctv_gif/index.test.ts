import type { APIGatewayEvent as AGWEvent } from 'aws-lambda';
import type { Data } from '@architect/functions';

import { decrypt } from '../../shared/crypto';
import { addPageView } from '../../shared/ddb';
import { handler } from '.';

type Obj = Record<string, string>;

jest.mock('../../shared/ddb', () => ({
  addPageView: jest.fn(),
}));

jest.mock('../../shared/crypto', () => ({
  decrypt: jest.fn(),
}));

jest.mock('@architect/functions', () => ({
  async tables() {
    return {} as Data;
  },
}));

describe('get-cctv_gif', () => {
  const id = 'some-encrypted-gibberish';
  const resource = '/some/page';
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

  afterEach(() => {
    (addPageView as jest.Mock).mockReset();
    (decrypt as jest.Mock).mockReset();
  });

  afterAll(() => {
    console.log = log;
  });

  describe('query params completely missing', () => {
    it('should always respond with 200', async () => {
      const {
        statusCode,
        body,
        headers: { ['content-type']: contentType },
      } = await handler({ queryStringParameters: null } as AGWEvent);

      expect(statusCode).toBe(200);
      expect(
        Buffer.from(body, 'base64').toString('utf8').startsWith('GIF89')
      ).toBe(true);
      expect(contentType).toBe('image/gif');
    });

    it('should not try to store a page view if ID & Resource are missing', async () => {
      await handler({ queryStringParameters: null } as AGWEvent);

      expect(addPageView).not.toHaveBeenCalled();
    });
  });

  describe('query params only containig ID', () => {
    beforeEach(() => {
      (decrypt as jest.Mock).mockReturnValue('user-sdg#site-fzxhg.tld');
    });

    it('should not try to store a page view if Resource is missing', async () => {
      await handler({ queryStringParameters: { id } as Obj } as AGWEvent);

      expect(decrypt).toHaveBeenCalledWith(id);
    });
  });

  describe('query params only containig Resource', () => {
    beforeEach(() => {
      (decrypt as jest.Mock).mockReturnValue('user-zufgj#site-rdgx.tld');
    });

    it('should not try to store a page view if Resource is missing', async () => {
      await handler({ queryStringParameters: { resource } as Obj } as AGWEvent);

      expect(addPageView).not.toHaveBeenCalled();
    });
  });

  describe('Decrypting the ID causes an error', () => {
    beforeEach(() => {
      (decrypt as jest.Mock).mockImplementationOnce(() => {
        throw new Error('could not decrypt ID');
      });
    });

    it('should return successfully nonetheless', async () => {
      const { statusCode } = await handler({
        queryStringParameters: { id, resource } as Obj,
        headers: {},
      } as AGWEvent);

      expect(statusCode).toBe(200);
    });
  });

  describe('Adding page view causes an error', () => {
    beforeEach(() => {
      (decrypt as jest.Mock).mockReturnValue('user-rwsx#site-khvj.tld');
      (addPageView as jest.Mock).mockRejectedValueOnce(
        'could not store page view'
      );
    });

    it('should return successfully nonetheless', async () => {
      const { statusCode } = await handler({
        queryStringParameters: { id, resource } as Obj,
        headers: {},
      } as AGWEvent);

      expect(statusCode).toBe(200);
    });
  });

  describe('Adding minimal page view data', () => {
    beforeEach(() => {
      (decrypt as jest.Mock).mockReturnValue('user-123#site-1.tld');
    });

    it('should store Resource', async () => {
      await handler({
        queryStringParameters: { id, resource } as Obj,
        headers: {},
      } as AGWEvent);

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
    beforeEach(() => {
      (decrypt as jest.Mock).mockReturnValue('user-456#site-2.tld');
    });

    it('should store Resource & Referrer', async () => {
      const referrer = 'https://some-other-site.tld/';
      await handler({
        queryStringParameters: { id, resource, referrer } as Obj,
        headers: {},
      } as AGWEvent);

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
    beforeEach(() => {
      (decrypt as jest.Mock).mockReturnValue('user-789#site-3.tld');
    });

    it('should store Resource, User Agent & Referrer', async () => {
      const referrer = 'https://some-other-site.tld/';
      const userAgent = {
        browserName: 'IE',
        browserVersion: '7',
        device: 'unknown',
        osName: 'Windows',
        osVersion: 'Vista',
      };
      await handler({
        queryStringParameters: { id, resource, referrer } as Obj,
        headers: { 'user-agent': userAgentString } as Obj,
      } as AGWEvent);

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
