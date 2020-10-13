import { handler } from './get-i';

jest.mock('../pages/page-i', () => ({
  pageInternal: jest.fn().mockReturnValueOnce('<h1>Hello, some-user!</h1>'),
}));

describe('get-i', () => {
  describe(`returning the user's start page`, () => {
    it('should have the corect response properties', async () => {
      const { statusCode, headers, body } = await handler({
        owner: 'some-user',
      });
      const { ['content-type']: contentType } = headers;

      expect(statusCode).toBe(200);
      expect(contentType).toBe('text/html; charset=utf8');
      expect(body).toBe('<h1>Hello, some-user!</h1>');
    });
  });
});
