import h from 'vhtml';
import type { HC } from 'vhtml';

import { MainHeader } from './main-header';
import type { Props as MainHeaderProps } from './main-header';

type Props = MainHeaderProps;

export const Layout: HC<Props> = ({ sites, text, children }) => (
  <div class="d-flex flex-column min-vh-100">
    <MainHeader sites={sites} text={text} />
    <main class="container-xxl d-flex flex-column flex-grow-1">{children}</main>
    <footer class="bd-footer p-3 mt-4 bg-light">
      <span>&copy; {new Date().getFullYear()}</span>
      <a
        class="px-4"
        href="https://github.com/herschel666/analytics"
        targt="_blank"
        rel="noopener noreferrer"
      >
        Github
      </a>
      <a
        href="https://twitter.com/herschel_r"
        targt="_blank"
        rel="noopener noreferrer"
      >
        twitter
      </a>
    </footer>
  </div>
);
