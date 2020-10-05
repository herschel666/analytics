import * as arc from '@architect/functions';
import type { APIGatewayResult as AGWResult } from '@architect/functions';

export const handler = async (): Promise<AGWResult> => {
  // TODO: replace static 'test-user' with dynamic one...
  const owner = 'test-user';
  const cookie = await arc.http.session.write({ owner });

  // TODO: implement authentication...
  return {
    statusCode: 301,
    headers: {
      'set-cookie': cookie,
      location: arc.http.helpers.url('/user'),
    },
  };
};
