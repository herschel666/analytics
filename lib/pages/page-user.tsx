import h from 'vhtml';
import type { HC } from 'vhtml';
import * as arc from '@architect/functions';

import { getTable, getSites } from '../shared/ddb';
import type { TableItem } from '../shared/ddb';
import { siteNameToHostname } from '../shared/util';
import { page } from './page';

type DDBPromise = [Promise<TableItem[]>, Promise<string[]>];
type DDBResults = [TableItem[], string[]];

interface Props {
  sites: string[];
  table: TableItem[];
  debug: string[] | undefined;
}

const filterTable = (table: TableItem[], keys: string[]) => {
  const result = table.filter((item) => {
    const [key] = item.SK.split('#');
    return keys.includes(key);
  });
  return JSON.stringify(result, null, 2);
};

const UserPage: HC<Props> = ({ sites, table, debug }) => (
  <div>
    <h1>ek|analytics</h1>
    <form
      method="post"
      action={`/user/${debug ? `?debug=${debug.join(',')}` : ''}`}
    >
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
              <strong>{siteNameToHostname(site)}</strong>
              &nbsp;
              <small>
                <a href={`/user/site/${site}`}>Page Views</a>
              </small>
              &nbsp;&bull;&nbsp;
              <small>
                <a href={`/user/site/${site}/referrers`}>Referrers</a>
              </small>
              &nbsp;&bull;&nbsp;
              <small>
                <a href={`/user/site/${site}/settings`}>Settings</a>
              </small>
            </li>
          ))}
        </ul>
      </div>
    )}
    <hr />
    {debug && (
      <details>
        <summary>DDB Dump</summary>
        <pre>{filterTable(table, debug)}</pre>
      </details>
    )}
  </div>
);

export const pageUser = async (
  owner: string,
  debug: Props['debug']
): Promise<string> => {
  const doc = await arc.tables();
  const promises: DDBPromise = [
    Promise.resolve([]),
    getSites(doc.analytics, owner),
  ];

  if (debug) {
    promises[0] = getTable(doc.analytics);
  }

  const [table, sites] = (await Promise.all(promises)) as DDBResults;

  return page(<UserPage sites={sites} table={table} debug={debug} />);
};
