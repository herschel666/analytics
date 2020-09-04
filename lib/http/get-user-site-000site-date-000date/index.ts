import * as arc from '@architect/functions';

import type { Request, Response } from '../../types/analytics';
import { pageSiteDate } from '../../pages/page-site-date';

interface Params {
  site: string;
  date: string;
}

type Req = Request<Params>;

export const handler = async (req: Req): Promise<Response> => {
  const { site, date } = req.pathParameters;
  const { owner } = await arc.http.session.read<Req, { owner: string }>(req);

  return await pageSiteDate(site, owner, date);
};
