import { handler } from './get-i-site-000site-devices';

const currentMonth = '2020-02';

class DateMock {
  toISOString() {
    return `${currentMonth}-29T19:44:17.863Z`;
  }
}

describe('get-i-site-000site-devices', () => {
  let globalDate;

  beforeAll(() => {
    globalDate = global.Date;
    global.Date = DateMock as DateConstructor;
  });

  afterAll(() => {
    global.Date = globalDate;
  });

  it('should redirect to the current month', async () => {
    const site = 'site_tld';
    const { statusCode, headers } = await handler({ site });
    const { location } = headers;

    expect(statusCode).toBe(301);
    expect(location).toBe(`/i/site/${site}/devices/${currentMonth}`);
  });
});
