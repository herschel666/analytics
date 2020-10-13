import h from 'vhtml';
import type { HC } from 'vhtml';

import type { TableItem } from '../shared/ddb';
import { pageFrame } from '../shared/page-frame';
import { Layout } from '../components/layout';

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

const Page: HC<Props> = ({ sites, table, debug }) => (
  <Layout sites={sites}>
    <form
      class="w-50 m-auto"
      method="post"
      action={`/i${debug ? `?debug=${debug.join(',')}` : ''}`}
    >
      <fieldset>
        <label for="site_url" class="form-label">
          Add a new site…
        </label>
        <div class="row">
          <div class="col col-sm-9">
            <input
              type="url"
              id="site_url"
              name="site_url"
              class="form-control"
              placeholder="Your site's URL…"
            />
          </div>
          <div class="col col-sm-3 text-right">
            <button class="btn btn-primary">Submit</button>
          </div>
        </div>
      </fieldset>
    </form>
    {debug && (
      <div>
        <hr />
        <details>
          <summary>DDB Dump</summary>
          <pre>{filterTable(table, debug)}</pre>
        </details>
      </div>
    )}
  </Layout>
);

export const pageInternal = ({ sites, table, debug }: Props): string =>
  pageFrame(<Page sites={sites} table={table} debug={debug} />);
