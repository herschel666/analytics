import { styled } from '../styled';

const barChartClass = ['block', 'w-full', 'relative', 'h-0', 'overflow-hidden'];
export const BarChart = styled('table', barChartClass);

const captionClass = ['block', 'w-full'];
export const Caption = styled('caption', captionClass);

const headClass = ['sr-only'];
export const Head = styled('thead', headClass);

const bodyClass = ['absolute', 'inset-0'];
export const Body = styled('tbody', bodyClass);

const barClass = ['absolute', 'bottom-0', 'h-full', 'text-white'];
export const Bar = styled('tr', barClass);

const barValueClass = [
  'absolute',
  'bottom-0',
  'pt-2',
  'bg-blue-700',
  'text-center',
];
export const BarValue = styled('td', barValueClass);

const barCaptionClass = [
  'absolute',
  'w-full',
  'text-center',
  'whitespace-pre',
  'z-10',
];
export const BarCaption = styled('th', barCaptionClass);
