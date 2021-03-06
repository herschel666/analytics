import type {
  Session,
  APIGatewayResult as AGWResult,
} from '@architect/functions';
import got from 'got';

import {
  ALLOWED_USERS,
  HOSTNAME,
  GH_APP_CLIENT_ID,
  GH_APP_CLIENT_SECRET,
} from '../shared/variables';
import { truthy } from '../shared/util';
import { pageIndex } from '../pages/page-index';

interface Args {
  owner?: string;
  code?: string;
  write: Session['write'];
}

type ApiResponse = { login: string } & Record<
  string,
  string | number | boolean | null
>;

class UserNotAllowedError extends Error {
  constructor() {
    super('The given is not alllowed.');
  }
}

const redirectURL = new URL('https://x');
redirectURL.hostname = HOSTNAME;

const isTestEnv = () => process.env.NODE_ENV === 'testing';

// TODO: implement serious error handling
const getGithubName = async (code: string): Promise<string> => {
  const {
    body: { access_token: accessToken },
  } = await got.post<{ access_token: string }>(
    'https://github.com/login/oauth/access_token',
    {
      json: {
        client_id: GH_APP_CLIENT_ID,
        client_secret: GH_APP_CLIENT_SECRET,
        redirect_url: redirectURL.toString(),
        code,
      },
      responseType: 'json',
    }
  );
  const {
    body: { login: name },
  } = await got<ApiResponse>('https://api.github.com/user', {
    headers: {
      Authorization: `token ${accessToken}`,
    },
    responseType: 'json',
  });

  if (!ALLOWED_USERS.includes(name)) {
    throw new UserNotAllowedError();
  }

  return name;
};

const getOwnerName = async (
  testEnv: boolean,
  owner?: string,
  code?: string
): Promise<string> | never => {
  switch (true) {
    case testEnv:
      return 'test-user';
    case truthy(code):
      return await getGithubName(code);
    case truthy(owner):
      return owner;
    default:
      throw new Error('Could not get a username.');
  }
};

export const handler = async ({
  owner,
  code,
  write,
}: Args): Promise<AGWResult> => {
  let notAllowed = false;

  if (truthy(owner) || truthy(code) || isTestEnv()) {
    try {
      const ownerName = await getOwnerName(isTestEnv(), owner, code);
      const cookie = await write({ owner: ownerName });
      return {
        statusCode: 301,
        headers: {
          'set-cookie': cookie,
          location: '/i',
        },
      };
    } catch (err) {
      if (err instanceof UserNotAllowedError) {
        notAllowed = true;
      } else {
        throw err;
      }
    }
  }

  const href = new URL('https://github.com/login/oauth/authorize');
  href.searchParams.append('client_id', GH_APP_CLIENT_ID);
  href.searchParams.append('redirect_url', redirectURL.toString());
  const body = pageIndex({ href: href.toString(), notAllowed });

  return {
    headers: {
      'content-type': 'text/html; charset=utf8',
      'cache-control':
        'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
    },
    statusCode: notAllowed ? 403 : 200,
    body,
  };
};
