type Anchor = HTMLAnchorElement | HTMLAreaElement;

export type PrefetchPages = (internalPages: Anchor[]) => void;

const EVENTS = ['mouseenter', 'focus'];

const isAlreadyPrefetched = (href: string): boolean =>
  Boolean(document.querySelector(`link[href="${href}"]`));

export const prefetchSinglePage = (href: string | null): void => {
  if (href === null) {
    return;
  }
  if (isAlreadyPrefetched(href)) {
    return;
  }

  document.head.appendChild(
    Object.assign(document.createElement('link'), {
      rel: 'prefetch',
      href,
    })
  );
};

const prefetch = (evnt: MouseEvent): void => {
  prefetchSinglePage((evnt.currentTarget as Anchor).getAttribute('href'));
};

export const prefetchPages: PrefetchPages = (internalPages) => {
  EVENTS.forEach((e) =>
    internalPages
      .filter((elem) => elem.dataset.prefetchingEnabled !== 'true')
      .forEach((elem) => {
        elem.addEventListener(e, prefetch);
        elem.dataset.prefetchingEnabled = 'true';
      })
  );
};

export const clearPrefetchListeners = (): void => {
  const links = Array.from(
    document.querySelectorAll('a[data-prefetching-enabled="true"]')
  );

  EVENTS.forEach((e) =>
    links.forEach((elem) => elem.removeEventListener(e, prefetch))
  );
};
