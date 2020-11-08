import type { ArcQueues } from '@architect/functions';

import { handler } from './get-cctv_gif';

describe('get-cctv_gif', () => {
  const id = 'some-encrypted-gibberish';
  const resource = '/some/page';
  const referrer = 'https://some-other-site.tld/';
  const log = console.log;
  const userAgent =
    'Mozilla/5.0 (compatible; MSIE 7.0; Windows NT 6.0; Trident/3.1)';

  beforeAll(() => {
    console.log = () => void 0;
  });

  afterAll(() => {
    console.log = log;
  });

  describe('query params completely missing', () => {
    const publish = jest.fn();
    const args = { queues: { publish } as ArcQueues, headers: {} };

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

      expect(publish).not.toHaveBeenCalled();
    });
  });

  describe('query params only containig ID', () => {
    const publish = jest.fn();
    const args = {
      queues: { publish } as ArcQueues,
      headers: {},
      id,
    };

    it('should not try to store a page view if Resource is missing', async () => {
      await handler(args);

      expect(publish).not.toHaveBeenCalled();
    });
  });

  describe('query params only containig Resource', () => {
    const publish = jest.fn();
    const args = {
      resource: '/some/page',
      queues: { publish } as ArcQueues,
      headers: {},
    };

    it('should not try to store a page view if Resource is missing', async () => {
      await handler(args);

      expect(publish).not.toHaveBeenCalled();
    });
  });

  describe('Adding minimal page view data', () => {
    const publish = jest.fn();
    const args = {
      queues: { publish } as ArcQueues,
      headers: {},
      resource,
      id,
    };

    it('should store Resource', async () => {
      await handler(args);
      const event = {
        name: 'track-page-view',
        payload: {
          id,
          resource,
          referrer: undefined,
          userAgent: undefined,
        },
      };

      expect(publish).toHaveBeenCalledWith(event);
    });
  });

  describe('Adding page view & referrer', () => {
    const publish = jest.fn();
    const args = {
      queues: { publish } as ArcQueues,
      headers: {},
      referrer,
      resource,
      id,
    };

    it('should store Resource & Referrer', async () => {
      await handler(args);
      const event = {
        name: 'track-page-view',
        payload: { id, resource, referrer, userAgent: undefined },
      };

      expect(publish).toHaveBeenCalledWith(event);
    });
  });

  describe('Adding complete page view', () => {
    const publish = jest.fn();
    const args = {
      queues: { publish } as ArcQueues,
      headers: { 'user-agent': userAgent },
      referrer,
      resource,
      id,
    };

    it('should store Resource, User Agent & Referrer', async () => {
      await handler(args);
      const event = {
        name: 'track-page-view',
        payload: { id, resource, referrer, userAgent },
      };

      expect(publish).toHaveBeenCalledWith(event);
    });
  });
});
