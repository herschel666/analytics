import type { ArcTableClient, ArcQueues } from '@architect/functions';

import { handler } from './post-i-site-000site-settings';

describe('post-i-site-000site-settings', () => {
  const doc = ({ delete: jest.fn() } as unknown) as ArcTableClient;
  const queues = ({ publish: jest.fn() } as unknown) as ArcQueues;
  const owner = 'some-user';
  const site = 'my_awesome_site';

  afterEach(() => {
    (doc.delete as jest.Mock).mockClear();
    (queues.publish as jest.Mock).mockClear();
  });

  it('should have the corect response properties', async () => {
    const {
      statusCode,
      headers: { location },
    } = await handler({
      doc,
      queues,
      site,
      owner,
    });

    expect(statusCode).toBe(301);
    expect(location).toBe('/i');
  });

  it('should delete the site', async () => {
    await handler({
      doc,
      queues,
      site,
      owner,
    });

    expect(doc.delete).toHaveBeenCalledWith({
      PK: `SITE#${owner}#${site}`,
      SK: `SITE#${owner}#${site}`,
    });
  });

  it('should publish the delegation of the site data deletion', async () => {
    await handler({
      doc,
      queues,
      site,
      owner,
    });

    expect(queues.publish).toHaveBeenCalledWith({
      name: 'delegate-site-deletion',
      payload: { site, owner },
    });
  });
});
