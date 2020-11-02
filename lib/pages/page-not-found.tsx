import h from 'vhtml';
import type { HC } from 'vhtml';

import { pageFrame } from '../shared/page-frame';
import { Layout } from '../components/layout';

interface Props {
  message: string;
}

const Page: HC<Props> = ({ message }) => (
  <Layout loggedIn={false}>
    <div class="w-50 m-auto text-center">
      <h1>{message}</h1>
      <a href="/i">Back to the start page</a>
    </div>
  </Layout>
);

export const pageNotFound = (
  message = 'Oops… this page does not exist.'
): string => pageFrame(<Page message={message} />);
