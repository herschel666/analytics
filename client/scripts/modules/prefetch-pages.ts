type Anchor = HTMLAnchorElement | HTMLAreaElement;

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

export const prefetchPages = (internalPages: Anchor[]): (() => void) => {
  const events = ['mouseenter', 'focus'];

  events.forEach((e) =>
    internalPages.forEach((elem) => elem.addEventListener(e, prefetch))
  );

  return () =>
    events.forEach((e) =>
      internalPages.forEach((elem) => {
        if (!document.body.contains(elem)) {
          console.warn('Not in the DOM anymore...', elem);
          return;
        }
        elem.removeEventListener(e, prefetch);
      })
    );
};
