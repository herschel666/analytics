import * as arc from '@architect/functions';

import { pageSiteDate } from '../../pages/page-site-date';

interface PathParams {
  site: string;
  date: string;
}

interface Req {
  pathParameters: PathParams;
  headers: Record<string, string>;
}

export const handler = async (req: Req) => {
  const { site, date } = req.pathParameters;
  const { owner } = await arc.http.session.read<Req, { owner: string }>(req);

  return await pageSiteDate(site, owner, date);
};
