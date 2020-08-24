export const getParams = (
  debug: boolean,
  site?: string,
  date?: string
): string => {
  const entries = Object.entries({ debug, site, date })
    .filter(([, v]) => Boolean(v))
    .map(([k, v]) => [k, String(v)]);
  return entries.length
    ? `?${new URLSearchParams(Object.fromEntries(entries))}`
    : '';
};

export const siteNameToHostname = (site: string): string =>
  site.split('-').join('.');

export const hostnameToSite = (hostname: string): string =>
  hostname.split('.').join('-');
