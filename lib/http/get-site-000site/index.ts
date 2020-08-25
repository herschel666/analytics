import { pageSite } from '../../pages/page-site';

interface PathParams {
  site: string;
}

interface Req {
  pathParameters: PathParams;
}

export const handler = async (req: Req) => {
  const { site } = req.pathParameters;

  return await pageSite(site);
};
