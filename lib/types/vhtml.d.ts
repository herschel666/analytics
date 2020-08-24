declare module 'vhtml' {
  import * as preact from 'preact';

  type Component<P = Record<string, unknown>> = (props: P) => string | null;

  function vhtml(
    type: string,
    props:
      | (preact.JSX.HTMLAttributes &
          preact.JSX.SVGAttributes &
          Record<string, unknown>)
      | null,
    ...children: preact.ComponentChildren[]
  ): string;
  function vhtml<T>(
    type: Component<T>,
    props: (preact.Attributes & T) | null,
    ...children: preact.ComponentChildren[]
  ): string;

  // eslint-disable-next-line @typescript-eslint/ban-types
  export type HC<T extends object = Record<string, unknown>> = (
    props: T & { children?: string }
  ) => ReturnType<typeof vhtml>;

  export default vhtml;
}
