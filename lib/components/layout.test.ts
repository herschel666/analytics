import h from 'vhtml';
import { getByText } from '@testing-library/dom';

import { Layout } from './layout';

jest.mock('./main-header', () => ({
  MainHeader: ({ sites, text }) =>
    h(null, null, [h('p', null, sites.join(', ')), h('p', null, text)]),
}));

describe('layout', () => {
  let mount: HTMLDivElement;

  beforeEach(() => {
    mount = document.body.appendChild(document.createElement('div'));
    mount.innerHTML = h(
      Layout,
      {
        loggedIn: false,
        sites: ['some-site_tld', 'other_site_tld'],
        text: 'random text',
      },
      h('p', null, 'the child element')
    );
  });

  afterEach(() => {
    mount.parentNode.removeChild(mount);
  });

  it('should render the passed text', () => {
    expect(getByText(mount, 'random text')).toBeDefined();
  });

  it('should render the passed sites', () => {
    expect(getByText(mount, 'some-site_tld, other_site_tld')).toBeDefined();
  });

  it('should render the children', () => {
    expect(getByText(mount, 'the child element')).toBeDefined();
  });

  it('should render the copyright note', () => {
    const year = new Date().getFullYear();
    expect(getByText(mount, `© ${year}`)).toBeDefined();
  });

  it('should render the github link', () => {
    const link = getByText(mount, 'Github') as HTMLAnchorElement;
    expect(link.href).toContain('herschel666/analytics');
  });

  it('should render the twitter link', () => {
    const link = getByText(mount, 'twitter') as HTMLAnchorElement;
    expect(link.href).toBe('https://twitter.com/herschel_r');
  });
});
