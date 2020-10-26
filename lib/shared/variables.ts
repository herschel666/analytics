const missing = [
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

export const SECRET_KEY = process.env.SECRET_KEY;
export const HOSTNAME = process.env.HOSTNAME;
export const GH_APP_CLIENT_ID = process.env.GH_APP_CLIENT_ID;
export const GH_APP_CLIENT_SECRET = process.env.GH_APP_CLIENT_SECRET;
