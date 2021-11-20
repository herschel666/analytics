interface TooltipOptions {
  container?: string | HTMLElement | boolean;
  trigger?: 'hover' | 'focus' | 'click';
}

interface Tooltip {
  new (elem: HTMLElement, options: TooltipOptions): unknown;
}

interface Bootstrap {
  Tooltip: Tooltip;
}

interface Window {
  bootstrap: Bootstrap;
}
