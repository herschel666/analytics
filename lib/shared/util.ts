import { Buffer } from 'buffer';

export const siteNameToHostname = (site: string): string =>
  site.split('_').join('.');

export const hostnameToSite = (hostname: string): string =>
  hostname.split('.').join('_');

export const daysAgo = (days: number): string =>
  new Date(Date.now() - Math.max(days, 0) * 24 * 3600 * 1000)
    .toISOString()
    .split('T')
    .shift();

export const btoa = (str: string): string =>
  Buffer.from(str).toString('base64');

export const atob = (str: string): string =>
  Buffer.from(str, 'base64').toString('utf8');
