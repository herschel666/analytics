import h from 'vhtml';
import type { HC } from 'vhtml';

import { pageFrame } from '../shared/page-frame';
import { Layout } from '../components/layout';

interface Props {
  message: string;
  link: string;
}

const Page: HC<Props> = ({ message, link }) => (
  <Layout loggedIn={false}>
    <div class="w-50 m-auto text-center">
      <h1>{message}</h1>
      <a href={link}>Back to the start page</a>
    </div>
  </Layout>
);

export const pageNotFound = ({
  message = 'Oops… this page does not exist.',
  link = '/i',
}: Partial<Props> = {}): string =>
  pageFrame(<Page message={message} link={link} />);
