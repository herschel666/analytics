import type { Data } from '@architect/functions';

import { handler } from './get-api-sites';

jest.mock('../shared/ddb.ts', () => ({
  getSites: jest.fn().mockResolvedValue(['lorem_com', 'dolor_ipsum_biz']),
}));

describe('get-api-sites', () => {
  const data = { analytics: 'analytics' } as unknown as Data;
  const owner = 'test-user';

  it('should return a list of pages', async () => {
    const { body, headers } = await handler({ data, owner });
    const { 'content-type': contentType } = headers;

    expect(body).toBe('["lorem_com","dolor_ipsum_biz"]');
    expect(contentType).toBe('application/json; charset=utf8');
  });
});
