import * as arc from '@architect/functions';
import type { APIGatewayResult as AGWResult } from '@architect/functions';
import type { APIGatewayEvent as AGWEvent } from 'aws-lambda';
import UAParser from 'ua-parser-js';

import { decrypt } from '../../shared/crypto';
import { hostnameToSite, getUserAgent } from '../../shared/util';
import { addPageView } from '../../shared/ddb';

const body = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

const parser = new UAParser();

export const handler = async (req: AGWEvent): Promise<AGWResult> => {
  const { id, resource, referrer: maybeReferrer = '' } =
    req.queryStringParameters || {};
  const [owner, hostname] = decrypt(id).split('#');
  const site = hostnameToSite(hostname);
  const referrer =
    maybeReferrer.length === 0
      ? undefined
      : decodeURIComponent(maybeReferrer.trim());

  if (site && resource) {
    const { pathname, search } = new URL(resource, 'http://example.com');
    const userAgent = getUserAgent(parser, req.headers['user-agent']);
    const doc = await arc.tables();

    try {
      await addPageView(
        doc,
        site,
        owner,
        `${pathname}${search}`,
        userAgent,
        referrer
      );
    } catch (err) {
      console.log(err);
    }
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
