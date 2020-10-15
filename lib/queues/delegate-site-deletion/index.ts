import * as arc from '@architect/functions';

import { getAllSiteRelatedEntries } from '../../shared/ddb';
import type { SiteRelatedEntry } from '../../shared/ddb';

interface EventRecord {
  site: string;
  owner: string;
  cursor?: string;
}

interface Event {
  Records: { body: string }[];
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const isValidDeletionEvent = (event: any): event is EventRecord =>
  typeof event.site === 'string' &&
  event.site.length > 0 &&
  typeof event.owner === 'string' &&
  event.owner.length > 0;

exports.handler = async (event: Event) => {
  const data = await arc.tables();

  const candidates = event.Records.map(({ body: event }) =>
    JSON.parse(event)
  ).filter((event: unknown) => isValidDeletionEvent(event));
  const deletions: SiteRelatedEntry[] = await Promise.all(
    candidates.map((event) =>
      getAllSiteRelatedEntries(
        data.analytics,
        event.owner,
        event.site,
        event.cursor
      )
    )
  );

  await Promise.all(
    deletions
      .map(({ entries, cursor }, i) =>
        entries
          .map(({ PK, SK }) =>
            arc.queues.publish({
              name: 'delete-site-entry',
              payload: { PK, SK },
            })
          )
          .concat(
            typeof cursor === 'string'
              ? [
                  arc.queues.publish({
                    name: 'delegate-site-deletion',
                    payload: {
                      site: candidates[i].site,
                      owner: candidates[i].owner,
                      cursor,
                    },
                  }),
                ]
              : []
          )
          .filter(Boolean)
      )
      .flat()
  );
};
