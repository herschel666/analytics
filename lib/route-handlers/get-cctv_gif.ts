import type {
  APIGatewayResult as AGWResult,
  ArcQueues,
} from '@architect/functions';
import type { APIGatewayEvent as AGWEvent } from 'aws-lambda';

interface Args {
  queues: ArcQueues;
  id?: string;
  resource?: string;
  headers: AGWEvent['headers'];
  referrer?: string;
}

const body = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

const getUserAgentString = (headers: AGWEvent['headers']): string | undefined =>
  (
    Object.entries(headers).find(([k]) => k.toLowerCase() === 'user-agent') ||
    []
  ).pop();

export const handler = async ({
  queues,
  id,
  resource,
  headers,
  referrer: maybeReferrer = '',
}: Args): Promise<AGWResult> => {
  if (id && resource) {
    const referrer =
      maybeReferrer.length === 0 || maybeReferrer === 'undefined'
        ? undefined
        : decodeURIComponent(maybeReferrer.trim());
    const userAgent = getUserAgentString(headers);
    await queues.publish({
      name: 'track-page-view',
      payload: { id, resource, referrer, userAgent },
    });
  }

  return {
    headers: {
      'content-type': 'image/gif',
      'cache-control':
        'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
    },
    statusCode: 200,
    isBase64Encoded: true,
    body,
  };
};
