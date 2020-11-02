import type {
  AsyncHandlerEvent as AGWEvent,
  APIGatewayResult as AGWResult,
} from '@architect/functions';

import { pageNotFound } from '../pages/page-not-found';

export const withOwner = async (
  req: AGWEvent
): Promise<AGWEvent | AGWResult> => {
  const { owner } = req.session;

  if (typeof owner === 'string' && owner.length) {
    return req;
  }

  const body = pageNotFound({
    message: `You're not allowed to see this page.`,
    link: '/',
  });

  return {
    statusCode: 401,
    headers: {
      'content-type': 'text/html; charset=utf8',
      'cache-control':
        'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
    },
    body,
  };
};
