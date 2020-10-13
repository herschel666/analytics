import type { Data, APIGatewayResult as AGWResult } from '@architect/functions';

import { hostnameToSite } from '../shared/util';
import { addSite } from '../shared/ddb';

import { handler as getHandler } from './get-i';

interface Args {
  data: Data;
  owner: string;
  siteUrl?: string;
  debug?: string;
}

export const handler = async ({
  data,
  owner,
  siteUrl,
  debug,
}: Args): Promise<AGWResult> => {
  if (siteUrl) {
    const { hostname } = new URL(siteUrl);

    // TODO: provide user feedback on error
    await addSite(data.analytics, hostnameToSite(hostname), owner);
  }

  return await getHandler({ data, owner, debug });
};
