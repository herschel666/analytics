import { Buffer } from 'buffer';
import type UAParser from 'ua-parser-js';

export const truthy = (x?: string): boolean =>
  typeof x === 'string' && x.length > 0;

export const siteNameToHostname = (site: string): string =>
  site.split('_').join('.');

export const hostnameToSite = (hostname = ''): string =>
  hostname.split('.').join('_');

export const isValidDate = (date?: string): boolean => {
  try {
    return new Date(date).toISOString().split('T').shift() === date;
  } catch {
    return false;
  }
};

export const daysAgo = (days: number): string =>
  new Date(Date.now() - Math.max(days, 0) * 24 * 3600 * 1000)
    .toISOString()
    .split('T')
    .shift();

export const btoa = (str: string): string =>
  Buffer.from(str).toString('base64');

export const atob = (str: string): string =>
  Buffer.from(str, 'base64').toString('utf8');

export const firstCharToLower = (s: string): string =>
  s.replace(/^([A-Z])/, (x) => x.toLowerCase());

export interface UserAgent {
  browserName: string;
  browserVersion: string;
  osName: string;
  osVersion: string;
  device: string;
}

const sanitizeBrowserVersion = (browserVersion: string): string =>
  browserVersion.split('.').shift();

const sanitizeOsVersion = (osVersion: string): string =>
  osVersion.split('.').slice(0, 2).filter(Boolean).join('.');

export const getUserAgent = (parser: UAParser, uaString = ''): UserAgent => {
  const {
    browser: {
      name: browserName = 'unknown',
      version: browserVersion = 'unknown',
    },
    os: { name: osName = 'unknown', version: osVersion = 'unknown' },
    device: { type: device = 'unknown' },
  } = parser.setUA(uaString).getResult();

  return {
    browserVersion: sanitizeBrowserVersion(browserVersion),
    osVersion: sanitizeOsVersion(osVersion),
    browserName,
    osName,
    device,
  };
};

export const niceMonth = (month: string): string | never => {
  const abbreviations = {
    '01': 'Jan',
    '02': 'Feb',
    '03': 'Mar',
    '04': 'Apr',
    '05': 'May',
    '06': 'Jun',
    '07': 'Jul',
    '08': 'Aug',
    '09': 'Sep',
    '10': 'Oct',
    '11': 'Nov',
    '12': 'Dec',
  };
  if (!abbreviations[month]) {
    throw new Error(`Invalid month "${month}" given.`);
  }
  return abbreviations[month];
};
