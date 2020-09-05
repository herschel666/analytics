import * as arc from '@architect/functions';
import type { APIGatewayResult as AGWResult } from '@architect/functions';
import type { APIGatewayEvent as AGWEvent } from 'aws-lambda';

import { pageSiteDate } from '../../pages/page-site-date';

export const handler = async (req: AGWEvent): Promise<AGWResult> => {
  const { site, date } = req.pathParameters;
  const { owner } = await arc.http.session.read<{ owner: string }>(req);

  return await pageSiteDate(site, owner, date);
};
