const assertElement = (
  element: Element | RadioNodeList
): element is HTMLInputElement | never => {
  if (element instanceof HTMLInputElement) {
    return true;
  }
  throw new Error(`The given element is invalid.`);
};

const isValidDate = (date: string): boolean =>
  new Date(date).toISOString().split('T').shift() === date;

export const init = (
  form: HTMLFormElement,
  visit: (uri: string) => void
): void => {
  form.addEventListener('submit', (evnt: Event) => {
    evnt.preventDefault();
    const maybeFrom = form.elements.namedItem('from');
    const maybeTo = form.elements.namedItem('to');
    assertElement(maybeFrom);
    assertElement(maybeTo);
    const from = maybeFrom as HTMLInputElement;
    const to = maybeTo as HTMLInputElement;

    if (!isValidDate(from.value.trim()) || !isValidDate(to.value.trim())) {
      return;
    }

    visit(`${form.action}?from=${from.value.trim()}&to=${to.value.trim()}`);
  });
};
