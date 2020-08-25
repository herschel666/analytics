export const siteNameToHostname = (site: string): string =>
  site.split('_').join('.');

export const hostnameToSite = (hostname: string): string =>
  hostname.split('.').join('_');
