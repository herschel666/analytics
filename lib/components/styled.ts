import h from 'vhtml';
import type { HC } from 'vhtml';
import type { JSX } from 'preact';

export const styled = (
  element: string,
  classes: string[]
): HC<JSX.HTMLAttributes & JSX.SVGAttributes> => ({
  children,
  class: className,
  ...props
}) =>
  h(
    element,
    {
      class: classes.concat(className).filter(Boolean).join(' '),
      ...props,
    },
    children
  );
