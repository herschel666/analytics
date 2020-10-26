import h from 'vhtml';
import type { HC } from 'vhtml';

import { pageFrame } from '../shared/page-frame';
import { Layout } from '../components/layout';

interface Props {
  href: string;
}

const Page: HC<Props> = ({ href }) => (
  <Layout loggedIn={false}>
    <div class="w-50 m-auto text-center">
      <a href={href} class="btn btn-dark">
        Log in with Github
      </a>
    </div>
  </Layout>
);

export const pageIndex = ({ href }: Props): string =>
  pageFrame(<Page href={href} />);
