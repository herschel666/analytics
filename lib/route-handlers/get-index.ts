import type { APIGatewayResult as AGWResult } from '@architect/functions';

interface Args {
  cookie: string;
  location: string;
}

export const handler = async ({
  cookie,
  location,
}: Args): Promise<AGWResult> => {
  // TODO: implement authentication...
  return {
    statusCode: 301,
    headers: {
      'set-cookie': cookie,
      location,
    },
  };
};
