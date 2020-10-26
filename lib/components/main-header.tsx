import h from 'vhtml';
import type { HC } from 'vhtml';

import { siteNameToHostname } from '../shared/util';

export interface Props {
  loggedIn: boolean;
  sites?: string[];
  text?: string;
}

export const MainHeader: HC<Props> = ({ loggedIn, sites, text }) => {
  return (
    <header class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid">
        <a class="navbar-brand" href="/i">
          ek|analytics
        </a>
        {Boolean(sites && sites.length) && (
          <nav class="navbar-nav d-flex flex-grow-1 justify-content-end mr-4">
            <span class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle"
                id="navbarDropdownMenuLink"
                role="button"
                data-toggle="dropdown"
                aria-expanded="false"
              >
                Choose a site…
              </a>
              <div
                class="dropdown-menu"
                aria-labelledby="navbarDropdownMenuLink"
              >
                {sites.map((site) => (
                  <span>
                    <a class="dropdown-item" href={`/i/site/${site}`}>
                      {siteNameToHostname(site)}
                    </a>
                  </span>
                ))}
              </div>
            </span>
          </nav>
        )}
        {Boolean(text) && <span class="navbar-text">{text}</span>}
        {loggedIn && (
          <form action="/logout" method="post">
            <button class="btn btn-outline-dark btn-sm">Logout</button>
          </form>
        )}
      </div>
    </header>
  );
};
