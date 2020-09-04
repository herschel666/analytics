import h from 'vhtml';
import type { HC } from 'vhtml';
import * as arc from '@architect/functions';

import type { Response } from '../types/analytics';
import { getTable, getSites } from '../shared/ddb';
import { siteNameToHostname } from '../shared/util';
import { page } from './page';

type DDBPromise = [Promise<string>, Promise<string[]>];
type DDBResults = [string, string[]];

interface Props {
  sites: string[];
  table: string;
  debug: boolean;
}

const IndexPage: HC<Props> = ({ sites, table, debug }) => (
  <div>
    <h1>ek|analytics</h1>
    <form method="post" action={`/user/${debug ? '?debug=true' : ''}`}>
      <fieldset>
        <legend>Add a new site…</legend>
        <div>
          <label for="site_url">Site URL</label>
          <input
            type="url"
            id="site_url"
            name="site_url"
            placeholder="Your site's URL…"
          />
        </div>
        <button>Submit</button>
      </fieldset>
    </form>
    {Boolean(sites.length) && (
      <div>
        <hr />
        <ul>
          {sites.map((site) => (
            <li>
              <a href={`/user/site/${site}`}>{siteNameToHostname(site)}</a>
            </li>
          ))}
        </ul>
      </div>
    )}
    <hr />
    {debug && (
      <details>
        <summary>DDB Dump</summary>
        <pre>{table}</pre>
      </details>
    )}
  </div>
);

export const pageIndex = async (
  owner: string,
  debug: boolean
): Promise<Response> => {
  const doc = await arc.tables();
  const promises: DDBPromise = [
    Promise.resolve(''),
    getSites(doc.analytics, owner),
  ];

  if (debug) {
    promises[0] = getTable(doc.analytics);
  }

  const [table, sites] = (await Promise.all(promises)) as DDBResults;

  return {
    headers: {
      'content-type': 'text/html; charset=utf8',
      'cache-control':
        'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
    },
    statusCode: 200,
    body: page(<IndexPage sites={sites} table={table} debug={debug} />),
  };
};
