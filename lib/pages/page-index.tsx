import h from 'vhtml';
import type { HC } from 'vhtml';

import { pageFrame } from '../shared/page-frame';
import { Layout } from '../components/layout';

interface Props {
  href: string;
  notAllowed: boolean;
}

const Page: HC<Props> = ({ href, notAllowed }) => (
  <Layout loggedIn={false}>
    <div class="w-50 m-auto text-center">
      {notAllowed && (
        <div class="alert alert-danger" role="alert">
          Sorry, private beta only.
        </div>
      )}
      <a href={href} class="btn btn-dark">
        Log in with Github
      </a>
    </div>
  </Layout>
);

export const pageIndex = ({ href, notAllowed }: Props): string =>
  pageFrame(<Page href={href} notAllowed={notAllowed} />);
