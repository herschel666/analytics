import { handler } from './get-user';

jest.mock('../pages/page-user', () => ({
  pageUser: jest.fn().mockReturnValueOnce('<h1>Hello, some-user!</h1>'),
}));

describe('get-user', () => {
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
