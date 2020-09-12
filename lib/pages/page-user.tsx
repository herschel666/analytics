import h from 'vhtml';
import type { HC } from 'vhtml';
import * as arc from '@architect/functions';

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

const UserPage: HC<Props> = ({ sites, table, debug }) => (
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
              <a href={`/user/site/${site}`}>{siteNameToHostname(site)}</a>(
              <small>
                <a href={`/user/site/${site}/settings`}>Settings</a>
              </small>
              )
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

export const pageUser = async (
  owner: string,
  debug: boolean
): Promise<string> => {
  const doc = await arc.tables();
  const promises: DDBPromise = [
    Promise.resolve(''),
    getSites(doc.analytics, owner),
  ];

  if (debug) {
    promises[0] = getTable(doc.analytics);
  }

  const [table, sites] = (await Promise.all(promises)) as DDBResults;

  return page(<UserPage sites={sites} table={table} debug={debug} />);
};
