import type { APIGatewayResult as AGWResult, Data } from '@architect/functions';
import type { APIGatewayEvent as AGWEvent } from 'aws-lambda';
import { UAParser } from 'ua-parser-js';

import { decrypt } from '../shared/crypto';
import { hostnameToSite, getUserAgent } from '../shared/util';
import { addPageView } from '../shared/ddb';

interface Args {
  data: Data;
  id?: string;
  resource?: string;
  headers: AGWEvent['headers'];
  referrer?: string;
}

const body = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

const parser = new UAParser();

const getOwnerAndHostnameFromId = (id?: string): string[] => {
  if (!id) {
    return [];
  }
  try {
    return decrypt(id).split('#');
  } catch (err) {
    console.log(err);
    return [];
  }
};

const getUserAgentString = (headers: AGWEvent['headers']): string | undefined =>
  (
    Object.entries(headers).find(([k]) => k.toLowerCase() === 'user-agent') ||
    []
  ).pop();

export const handler = async ({
  data,
  id,
  resource,
  headers,
  referrer: maybeReferrer = '',
}: Args): Promise<AGWResult> => {
  const [owner, hostname] = getOwnerAndHostnameFromId(id);
  const site = hostnameToSite(hostname);
  const referrer =
    maybeReferrer.length === 0
      ? undefined
      : decodeURIComponent(maybeReferrer.trim());

  if (owner && site && resource) {
    const { pathname, search } = new URL(resource, 'http://example.com');
    const userAgent = getUserAgent(parser, getUserAgentString(headers));

    try {
      await addPageView(
        data,
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
