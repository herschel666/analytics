import { handler } from './get-index';

const args = {
  cookie: 'idx=session-cookie',
  location: '/i',
};

describe('get-index', () => {
  it('writes the session cookie', async () => {
    const {
      headers: { ['set-cookie']: cookie },
    } = await handler(args);

    expect(cookie).toBe(args.cookie);
  });

  it('redirects to /i', async () => {
    const {
      statusCode,
      headers: { location },
    } = await handler(args);

    expect(statusCode).toBe(301);
    expect(location).toBe(args.location);
  });
});
