import * as arc from '@architect/functions';

interface EventRecord {
  PK: string;
  SK: string;
}

interface Event {
  Records: { body: string }[];
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const isValidEvent = (event: any): event is EventRecord =>
  typeof event.PK === 'string' &&
  event.PK.length > 0 &&
  typeof event.SK === 'string' &&
  event.SK.length > 0;

exports.handler = async (event: Event) => {
  const data = await arc.tables();

  await Promise.all(
    event.Records.map(({ body: event }) => JSON.parse(event))
      .filter((event: unknown) => isValidEvent(event))
      .map(({ PK, SK }) => data.analytics.delete({ PK, SK }))
  );
};
