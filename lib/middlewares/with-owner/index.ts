import type {
  AsyncHandlerEvent as AGWEvent,
  APIGatewayResult as AGWResult,
} from '@architect/functions';

export const withOwner = (forbidden: () => AGWResult) => async (
  req: AGWEvent
): Promise<AGWEvent | AGWResult> => {
  const { owner } = req.session;

  if (typeof owner === 'string' && owner.length) {
    return req;
  }

  return forbidden();
};
