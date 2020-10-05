import { handler } from '.';

jest.mock('@architect/functions', () => ({
  http: {
    session: { write: () => 'idx=session-cookie' },
    helpers: { url: () => '/user' },
  },
}));

describe('get-index', () => {
  it('writes the session cookie', async () => {
    const {
      headers: { ['set-cookie']: cookie },
    } = await handler();

    expect(cookie).toBe('idx=session-cookie');
  });

  it('redirects to /user', async () => {
    const {
      statusCode,
      headers: { location },
    } = await handler();

    expect(statusCode).toBe(301);
    expect(location).toBe('/user');
  });
});
