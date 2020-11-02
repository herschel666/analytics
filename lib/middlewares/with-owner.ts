import * as arc from '@architect/functions';
import type {
  AsyncHandlerEvent as AGWEvent,
  APIGatewayResult as AGWResult,
} from '@architect/functions';

export const withOwner = async (
  req: AGWEvent
): Promise<AGWEvent | AGWResult> => {
  const { owner } = req.session;

  if (typeof owner === 'string' && owner.length) {
    return req;
  }

  return {
    statusCode: 302,
    headers: {
      location: arc.http.helpers.url('/'),
    },
  };
};
