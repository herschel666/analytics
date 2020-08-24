import * as path from 'path';
import { sync as globby } from 'globby';
import Bundler from 'parcel-bundler';
import type { ParcelOptions } from 'parcel-bundler';

const ROOT_DIR = path.resolve(__dirname, '..');
const HTTP_DIR = path.join(__dirname, 'http');
const CACHE_DIR = path.join(ROOT_DIR, '.cache');

const prod = Boolean(
  process.argv.find((flag) => flag === '-p' || flag === '--production')
);
const watch =
  Boolean(process.argv.find((flag) => flag === '-w' || flag === '--watch')) &&
  !prod;
const verbose = Boolean(
  process.argv.find((flag) => flag === '-v' || flag === '--verbose')
);
const nodeEnv = prod ? 'production' : 'development';

const baseOptions: ParcelOptions = {
  cacheDir: CACHE_DIR,
  minify: prod,
  scopeHoist: true,
  target: 'node',
  hmr: false,
  watch,
};

const files = globby(path.join(HTTP_DIR, '**/index.{ts,tsx}'));

if (verbose) {
  console.log('Found files to compile...');
  console.log(files);
}

const bundle = async (file: string): Promise<void> => {
  const outDir = path.dirname(file).replace('/lib/', '/src/');
  const outFile = 'index.js';
  const options: ParcelOptions = {
    ...baseOptions,
    outDir,
    outFile,
  };
  const bundler = new Bundler([file], options);

  bundler.on('buildEnd', () => {
    if (!watch) {
      console.log('Successfully bundled thingies.');
    }
  });
  bundler.on('buildError', (error) => {
    console.log('Yikes...');
    console.log(error);
  });
  await bundler.bundle();
};

process.env.NODE_ENV = nodeEnv;

(async () => {
  for (const file of files) {
    await bundle(file);
  }
})();
