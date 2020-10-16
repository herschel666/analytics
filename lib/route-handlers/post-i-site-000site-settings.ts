import type {
  ArcTableClient,
  ArcQueues,
  APIGatewayResult as AGWResult,
} from '@architect/functions';

interface Args {
  queues: ArcQueues;
  doc: ArcTableClient;
  site: string;
  owner: string;
}

// TODO: add tests
export const handler = async ({
  queues,
  doc,
  site,
  owner,
}: Args): Promise<AGWResult> => {
  // TODO: give error feedback in case of failure
  try {
    const key = `SITE#${owner}#${site}`;
    const deletion = doc.delete({ PK: key, SK: key });
    const publish = queues.publish({
      name: 'delegate-site-deletion',
      payload: { site, owner },
    });
    await Promise.all([deletion, publish]);
  } catch (err) {
    console.log(err);
  }

  // TOOD: put name of deleted site into session value & give feedback on startpage
  return {
    statusCode: 301,
    headers: {
      location: '/i',
    },
  };
};
