import * as arc from '@architect/functions';
import { UAParser } from 'ua-parser-js';

import { decrypt } from '../../shared/crypto';
import { hostnameToSite, getUserAgent } from '../../shared/util';
import { addPageView } from '../../shared/ddb';

interface EventRecord {
  id: string;
  resource: string;
  referrer: string | undefined;
  userAgent?: string;
}

interface Event {
  Records: { body: string }[];
}

const parser = new UAParser();

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const isEventRecord = (event: any): event is EventRecord =>
  typeof event.id === 'string' &&
  event.id.length > 0 &&
  typeof event.resource === 'string' &&
  event.resource.length > 0;

const getOwnerAndHostnameFromId = (id: string): string[] => {
  try {
    return decrypt(id).split('#');
  } catch (err) {
    console.log(err);
    return [];
  }
};

exports.handler = async (event: Event): Promise<void> => {
  const data = await arc.tables();

  await Promise.all(
    event.Records.map(({ body: event }) => JSON.parse(event))
      .filter((event: unknown) => isEventRecord(event))
      .map(({ id, resource, referrer, userAgent: userAgentString }) => {
        const [owner, hostname] = getOwnerAndHostnameFromId(id);

        if (!owner || !hostname) {
          return;
        }

        const site = hostnameToSite(hostname);
        const { pathname, search } = new URL(resource, 'http://example.com');
        const userAgent = getUserAgent(parser, userAgentString);

        return addPageView(
          data,
          site,
          owner,
          `${pathname}${search}`,
          userAgent,
          referrer
        );
      })
  );
};
