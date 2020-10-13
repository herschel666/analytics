import type { APIGatewayResult as AGWResult } from '@architect/functions';

interface Args {
  site: string;
}

export const handler = async ({ site }: Args): Promise<AGWResult> => {
  const dateString = new Date().toISOString().split('T').shift().split('-');
  const [year, month, , date = `${year}-${month}`] = dateString;

  return {
    headers: {
      'cache-control':
        'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
      location: `/i/site/${site}/devices/${date}`,
    },
    statusCode: 301,
  };
};
