import type {
  SubsequentAsyncHandlerEvent as AGWEvent,
  APIGatewayResult as AGWResult,
} from '@architect/functions';

export const handler = async (req: AGWEvent): Promise<AGWResult> => {
  const { site } = req.pathParameters;
  const dateString = new Date().toISOString().split('T').shift().split('-');
  const [year, month, , date = `${year}-${month}`] = dateString;

  return {
    headers: {
      'cache-control':
        'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
      location: `/user/site/${site}/devices/${date}`,
    },
    statusCode: 301,
  };
};
