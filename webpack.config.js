/**
 * webpack.config.js
 *
 * This config accepts an 'env' parameter, which can take on values 'prod' or
 * 'dev'. (Defaults to 'dev'.)
 * Specify the one you want by running `npx webpack --env <prod|dev>`.
 * Alternatively, use 'script/build` for development, and 'script/cibuild' for
 * production.
 *
 * The config's output target is assets/js/primer_spec_plugin.min.js.
 */

const fs = require('fs');
const path = require('path');
const semver = require('semver');
const webpack = require('webpack');

const VERSION_RAW = fs.readFileSync(
  path.resolve(__dirname, 'VERSION'),
  'utf-8',
);

// Starting with v1.2, every minor version's assets will be hosted in a
// separate directory (so that specs that use older versions of Primer Spec
// will still render correctly).
const semver_version = semver.coerce(VERSION_RAW);
const VERSION_MINOR_STR = `v${semver_version.major}.${semver_version.minor}`;

function getBuildMode(env) {
  return env && env.production ? 'production' : 'development';
}

module.exports = (env) => ({
  mode: getBuildMode(env),
  context: path.resolve(__dirname, 'src_js/'),
  entry: './main.tsx',
  output: {
    path: path.join(__dirname, `/assets/${VERSION_MINOR_STR}/js/`),
    filename: 'primer_spec_plugin.min.js',
  },
  module: {
    rules: [
      // JavaScript loader
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /(node_modules|bower_components)/,
        query: {
          babelrc: false,
          presets: [['@babel/preset-env', { modules: false }]],
        },
      },
      // TypeScript loader
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  // When importing files, no need to mention these file-extensions
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },
  plugins: [
    // These variables become available in any file
    new webpack.DefinePlugin({
      'process.env.VERSION_RAW': JSON.stringify(VERSION_RAW),
      'process.env.VERSION_MINOR_STR': JSON.stringify(VERSION_MINOR_STR),
      'process.env.BUILD_MODE': JSON.stringify(getBuildMode(env)),
    }),
  ],
  // Generate sourcemaps
  devtool: 'source-map',
  // Minimize output
  stats: 'minimal',
  devServer: {
    stats: {
      hash: false,
      version: false,
      timings: false,
      assets: false,
      chunks: false,
    },
  },
});
