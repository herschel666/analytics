import type {
  Session,
  APIGatewayResult as AGWResult,
} from '@architect/functions';
import got from 'got';

import {
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

const redirectURL = new URL('https://x');
redirectURL.hostname = HOSTNAME;

const isTestEnv = () => process.env.NODE_ENV === 'testing';

// TODO: implement serious error handling
const getGithubName = async (code: string): Promise<string> => {
  const { body } = await got.post<{ access_token: string }>(
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
    body: { name },
  } = await got<{ name: string }>('https://api.github.com/user', {
    headers: {
      Authorization: `token ${body.access_token}`,
    },
    responseType: 'json',
  });
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
  if (truthy(owner) || truthy(code) || isTestEnv()) {
    const ownerName = await getOwnerName(isTestEnv(), owner, code);
    const cookie = await write({ owner: ownerName });
    return {
      statusCode: 301,
      headers: {
        'set-cookie': cookie,
        location: '/i',
      },
    };
  }

  const href = new URL('https://github.com/login/oauth/authorize');
  href.searchParams.append('client_id', GH_APP_CLIENT_ID);
  href.searchParams.append('redirect_url', redirectURL.toString());
  const body = pageIndex({ href: href.toString() });

  return {
    headers: {
      'content-type': 'text/html; charset=utf8',
      'cache-control':
        'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
    },
    statusCode: 200,
    body,
  };
};
