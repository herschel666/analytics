import { Buffer } from 'buffer';
import type { UAParser } from 'ua-parser-js';

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

export const getUserAgent = (
  parser: typeof UAParser['prototype'],
  uaString: string
): UserAgent => {
  const {
    browser: { name: browserName, version: browserVersion },
    os: { name: osName, version: osVersion },
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
