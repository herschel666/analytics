import * as path from 'path';
import { sync as globby } from 'globby';
import webpack from 'webpack';
import type { Configuration } from 'webpack';
import ForkTSCheckerPlugin from 'fork-ts-checker-webpack-plugin';

const ROOT_DIR = path.resolve(__dirname, '..');
const LIB_DIR = path.join(ROOT_DIR, 'lib');
const SRC_DIR = path.join(ROOT_DIR, 'src');

const prod = Boolean(
  process.argv.find((flag) => flag === '-p' || flag === '--production')
);
const watch =
  Boolean(process.argv.find((flag) => flag === '-w' || flag === '--watch')) &&
  !prod;
const nodeEnv = prod ? 'production' : 'development';

let folders = 'http,queues';
if (prod) {
  folders += ',macros';
}
const files = globby(path.join(LIB_DIR, `{${folders}}/*/index.{ts,tsx}`));

const baseConfig: Configuration = {
  cache: watch || {
    type: 'filesystem',
    cacheDirectory: path.resolve(ROOT_DIR, '.cache'),
  },
  mode: nodeEnv,
  target: 'node',
  node: { global: false },
  devtool: prod ? false : 'inline-source-map',
  context: LIB_DIR,
  output: {
    libraryTarget: 'commonjs2',
    filename: 'index.js',
    path: SRC_DIR,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: { keyv: false },
  },
  module: {
    noParse: /aws-sdk/,
    rules: [
      {
        test: /\.tsx?$/,
        include: [LIB_DIR],
        exclude: [/node_modules/, __filename],
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
      {
        test: /\.ico$/,
        include: [LIB_DIR],
        exclude: [/node_modules/, __filename],
        use: {
          loader: 'url-loader',
          options: {
            generator: (content) => content.toString('base64'),
          },
        },
      },
    ],
  },
  externals: {
    'aws-sdk': 'commonjs2 aws-sdk',
    '@architect/functions': 'commonjs2 @architect/functions',
    'ua-parser-js': 'commonjs2 ua-parser-js',
    faker: 'commonjs2 faker',
    vhtml: 'commonjs2 vhtml',
  },
  optimization: {
    sideEffects: false,
    nodeEnv,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(
        nodeEnv === 'production' ? nodeEnv : 'testing'
      ),
    }),
  ],
};

const watchOptions = {
  ignored: [
    '.cache/**',
    '.db/**',
    '.github/**',
    'dist/**',
    'src/**',
    'node_modules/**',
  ],
};
const forkCheckerOptions = {
  async: true,
  typescript: {
    context: ROOT_DIR,
    configFile: path.join(ROOT_DIR, 'tsconfig.json'),
  },
};

const compile = async (
  configuration: webpack.Configuration,
  watchOptions?: Record<string, unknown>
): Promise<string | Error> =>
  new Promise((resolve, reject) => {
    const compiler = webpack(configuration);

    if (watchOptions) {
      compiler.watch(watchOptions, (err, stats) => {
        switch (true) {
          case Boolean(err):
            reject(err);
            break;
          case stats.hasErrors() || stats.hasWarnings():
            resolve(stats.toString('minimal'));
        }
      });
    } else {
      compiler.run((err, stats) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(stats.toString('minimal'));
      });
    }
  });

let tsForkCheckerApplied = false;
(async () => {
  for (const file of files) {
    const name = path.basename(path.dirname(file));
    const entry = `./${file.split('/lib/').pop()}`;
    const outputPath = path.resolve(SRC_DIR, path.dirname(entry));
    const configuration = {
      ...baseConfig,
      plugins: [
        ...baseConfig.plugins,
        ...(prod || tsForkCheckerApplied
          ? []
          : [new ForkTSCheckerPlugin(forkCheckerOptions)]),
      ],
      output: {
        ...baseConfig.output,
        path: outputPath,
      },
      entry,
      name,
    };
    tsForkCheckerApplied = true;

    if (watch) {
      compile(configuration, watchOptions).then(console.log, console.error);
    } else {
      console.log(await compile(configuration));
    }
  }
})();
