import nock from 'nock';

import { handler } from './get-index';

describe('get-index', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'misc';
  });

  afterAll(() => {
    process.env.NODE_ENV = 'testing';
  });

  describe('logged out', () => {
    const write = jest.fn();

    it('should render the Login button', async () => {
      const { body } = await handler({ write });

      expect(body).toContain('Log in with Github');
      expect(body).toContain('https://github.com/login/oauth/authorize');
      expect(body).toContain('client_id=gh-client-id');
      expect(body).toContain(
        `redirect_url=${encodeURIComponent('https://app.url/')}`
      );
      expect(write).not.toHaveBeenCalled();
    });
  });

  describe('logged in', () => {
    const write = async ({ owner }: { owner: string }): Promise<string> =>
      `owner=${owner}`;

    it('should redirect to the internal page', async () => {
      const { headers, statusCode } = await handler({ owner: 'foobar', write });

      expect(headers['set-cookie']).toBe('owner=foobar');
      expect(statusCode).toBe(301);
    });
  });

  describe('handling redirect from Github', () => {
    const username = 'the-username';
    const code = 'some-secret-auth-code';
    const accessToken = 'some-secret-access-token';
    const first = nock('https://github.com')
      .post('/login/oauth/access_token', {
        client_id: 'gh-client-id',
        client_secret: 'gh-client-secret',
        redirect_url: 'https://app.url/',
        code,
      })
      .reply(200, {
        access_token: accessToken,
      });
    const second = nock('https://api.github.com', {
      reqheaders: {
        Authorization: `token ${accessToken}`,
      },
    })
      .get('/user')
      .reply(200, {
        name: username,
      });
    const write = async ({ owner }: { owner: string }): Promise<string> =>
      `owner=${owner}`;

    it('should retrieve & store the username from Github', async () => {
      const { headers, statusCode } = await handler({ code, write });

      expect(headers['set-cookie']).toBe(`owner=${username}`);
      expect(statusCode).toBe(301);
      expect(first.isDone()).toBe(true);
      expect(second.isDone()).toBe(true);
    });
  });
});
