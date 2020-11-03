import type { APIGatewayResult as AGWResult } from '@architect/functions';

interface Args {
  site: string;
  type: 'devices' | 'referrers';
}

export const handler = async ({ site, type }: Args): Promise<AGWResult> => {
  const dateString = new Date().toISOString().split('T').shift().split('-');
  const [year, month, , date = `${year}-${month}`] = dateString;

  return {
    headers: {
      'cache-control':
        'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
      location: `/i/site/${site}/${type}/${date}`,
    },
    statusCode: 301,
  };
};
