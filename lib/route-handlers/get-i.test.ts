import type { Data } from '@architect/functions';

import { getTable, getSites } from '../shared/ddb';
import { pageInternal } from '../pages/page-i';
import { handler } from './get-i';

jest.mock('../shared/ddb', () => ({
  getTable: jest.fn().mockResolvedValue([{ type: 'table' }]),
  getSites: jest.fn().mockResolvedValue([{ type: 'site' }]),
}));

jest.mock('../pages/page-i', () => ({
  pageInternal: jest.fn().mockReturnValue('some HTML...'),
}));

describe('get-i', () => {
  const data = { analytics: 'analytics' } as unknown as Data;
  const owner = 'some-user';

  describe(`returning the user's start page`, () => {
    it('should have the corect response properties', async () => {
      const { statusCode, headers, body } = await handler({ data, owner });
      const { ['content-type']: contentType } = headers;

      expect(statusCode).toBe(200);
      expect(contentType).toBe('text/html; charset=utf8');
      expect(body).toBe('some HTML...');
    });

    it('should request the sites from the DDB', async () => {
      await handler({ data, owner });

      expect(getSites).toHaveBeenCalledWith('analytics', owner);
    });

    it('should not request the table from the DDB', async () => {
      await handler({ data, owner });

      expect(getTable).not.toHaveBeenCalled();
    });

    it('should call the view function', async () => {
      await handler({ data, owner });

      expect(pageInternal).toHaveBeenCalledWith({
        sites: [{ type: 'site' }],
        table: [],
        debug: undefined,
      });
    });
  });

  describe('adding debug data', () => {
    const debug = ['SITES', 'PAGEVIEWS'];

    it('should request the table from the DDB', async () => {
      await handler({ data, owner, debug: debug.join(',') });

      expect(getTable).toHaveBeenCalledWith('analytics');
    });

    it('should pass on the debug data to the view function', async () => {
      await handler({ data, owner, debug: debug.join(',') });

      expect(pageInternal).toHaveBeenCalledWith({
        sites: [{ type: 'site' }],
        table: [{ type: 'table' }],
        debug,
      });
    });
  });
});
