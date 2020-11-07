interface Tooltip {
  new (elem: HTMLElement): unknown;
}

interface Bootstrap {
  Tooltip: Tooltip;
}

interface Window {
  bootstrap: Bootstrap;
}
