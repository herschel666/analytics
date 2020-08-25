import { pageSiteDate } from '../../pages/page-site-date';

interface PathParams {
  site: string;
  date: string;
}

interface Req {
  pathParameters: PathParams;
}

export const handler = async (req: Req) => {
  const { site, date } = req.pathParameters;

  return await pageSiteDate(site, date);
};
