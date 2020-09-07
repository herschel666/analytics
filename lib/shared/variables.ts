const missing = ['SECRET_KEY'].filter(
  (name) =>
    typeof process.env[name] !== 'string' || process.env[name].length === 0
);

if (missing.length) {
  throw Error(`Missing ENV variables:\n${missing.join('\n')}`);
}

export const SECRET_KEY = process.env.SECRET_KEY;
