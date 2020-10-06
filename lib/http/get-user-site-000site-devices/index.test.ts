import type { APIGatewayEvent as AGWEvent } from 'aws-lambda';

import { handler } from '.';

const currentMonth = '2020-02';

class DateMock {
  toISOString() {
    return `${currentMonth}-29T19:44:17.863Z`;
  }
}

describe('get-user-site-000site-devices', () => {
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
    const { statusCode, headers } = await handler(({
      session: { owner: 'nobody' },
      pathParameters: { site },
    } as unknown) as AGWEvent);
    const { location } = headers;

    expect(statusCode).toBe(301);
    expect(location).toBe(`/user/site/${site}/devices/${currentMonth}`);
  });
});
