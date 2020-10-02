import * as path from 'path';
import { sync as globby } from 'globby';
import Bundler from 'parcel-bundler';
import type { ParcelOptions, ParcelBundle } from 'parcel-bundler';

type FileOpts = [string, string, ParcelOptions?];
type Files = Record<string, FileOpts>;

const ROOT_DIR = path.resolve(__dirname, '..');
const HTTP_DIR = path.join(__dirname, 'http');
const CLIENT_DIR = path.join(__dirname, 'client');
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
  hmr: false,
  watch,
};

const serverFiles = globby(path.join(HTTP_DIR, '**/index.{ts,tsx}')).reduce(
  (acc: Files, file: string) => {
    const opts: FileOpts = [
      '/lib/',
      '/src/',
      {
        target: 'node',
      },
    ];
    return { ...acc, [file]: opts };
  },
  {}
);
const browserScriptsOpts: FileOpts = [
  '/lib/client/scripts',
  '/dist',
  { target: 'browser' },
];
const browserStylesOpts: FileOpts = [
  '/lib/client/styles',
  '/dist',
  { target: 'browser' },
];
const files = {
  ...serverFiles,
  [path.join(CLIENT_DIR, 'scripts', 'index.ts')]: browserScriptsOpts,
  [path.join(CLIENT_DIR, 'styles', 'main.css')]: browserStylesOpts,
};

if (verbose) {
  console.log('Found files to compile...');
  console.log(Object.keys(files));
}

const getFileName = (file: string): string | never => {
  const [name, ext] = path.basename(file).split('.');
  switch (ext) {
    case 'ts':
    case 'tsx':
      return `${name}.js`;
    case 'css':
      return `${name}.${ext}`;
    default:
      console.log(file);
      throw new Error(`Invalid file file with extension "${ext}".`);
  }
};

const bundle = (
  file: string,
  from: string,
  to: string,
  opts: ParcelOptions = {}
): Promise<ParcelBundle> => {
  const outDir = path.dirname(file).replace(from, to);
  const outFile = getFileName(file);
  const options: ParcelOptions = {
    ...baseOptions,
    ...opts,
    outDir,
    outFile,
  };
  const bundler = new Bundler(file, options);

  bundler.on('buildEnd', () => {
    if (!watch) {
      console.log('Successfully bundled thingies.');
    }
  });
  bundler.on('buildError', (error) => {
    console.log('Yikes...');
    console.log(error);
  });
  return bundler.bundle();
};

process.env.NODE_ENV = nodeEnv;

(async () => {
  for (const [file, [from, to, opts = {}]] of Object.entries(files)) {
    try {
      await bundle(file, from, to, opts);
    } catch {
      if (!watch) {
        process.exit(1);
      }
    }
  }
})();
