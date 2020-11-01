const missing = [
  'ALLOWED_USERS',
  'SECRET_KEY',
  'HOSTNAME',
  'GH_APP_CLIENT_ID',
  'GH_APP_CLIENT_SECRET',
].filter(
  (name) =>
    typeof process.env[name] !== 'string' || process.env[name].length === 0
);

if (missing.length) {
  throw Error(`Missing ENV variables:\n${missing.join('\n')}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ensureAllowedUsers = (x: any): x is string[] =>
  Array.isArray(x) && x.find((item) => typeof item !== 'string') === undefined;

export const ALLOWED_USERS = ((): string[] | never => {
  const allowedUsers = process.env.ALLOWED_USERS.split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (!ensureAllowedUsers(allowedUsers)) {
    throw new Error('ALLOWED_USERS does not have the correct format.');
  }
  return allowedUsers;
})();

export const SECRET_KEY = process.env.SECRET_KEY;
export const HOSTNAME = process.env.HOSTNAME;
export const GH_APP_CLIENT_ID = process.env.GH_APP_CLIENT_ID;
export const GH_APP_CLIENT_SECRET = process.env.GH_APP_CLIENT_SECRET;
