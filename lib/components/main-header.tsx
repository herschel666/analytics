import h from 'vhtml';
import type { HC } from 'vhtml';

import { Fragment } from './fragment';
import { siteNameToHostname } from '../shared/util';

export interface Props {
  loggedIn: boolean;
  sites?: string[];
  text?: string;
}

const sitesSelectorBaseClasses = [
  'navbar-nav',
  'd-flex',
  'flex-grow-1',
  'justify-content-end',
  'mr-4',
];

export const MainHeader: HC<Props> = ({ loggedIn, sites = [], text }) => {
  const sitesSelectorClasses = [
    ...sitesSelectorBaseClasses,
    ...(sites.length ? [] : ['invisible']),
  ];
  const navbarBrandProps = text
    ? {
        href: '/i',
        'data-toggle': 'tooltip',
        'data-placement': 'bottom',
        title: 'Back to overview',
      }
    : {};
  const NavbarBrand = text ? 'a' : 'span';

  return (
    <header class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid">
        <NavbarBrand class="navbar-brand" {...navbarBrandProps}>
          {text || 'ek|analytics'}
        </NavbarBrand>
        {loggedIn && (
          <Fragment>
            <nav
              class={sitesSelectorClasses.join(' ')}
              id="sites-selector"
              data-turbolinks-permanent={true}
            >
              <div class="nav-item dropdown">
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
                  class="dropdown-menu js-dropdown-menu"
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
              </div>
            </nav>
            <form action="/logout" method="post">
              <button class="btn btn-outline-dark btn-sm">Logout</button>
            </form>
          </Fragment>
        )}
      </div>
    </header>
  );
};
