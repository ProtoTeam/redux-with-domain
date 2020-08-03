const webpack = require('atool-build/lib/webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const failPlugin = require('webpack-fail-plugin');
const StatsPlugin = require('stats-webpack-plugin');
const pkg = require('./package.json');

const wrapStr = str => `"${str}"`;
const inProduction = process.env.NODE_ENV !== 'development';

module.exports = webpackConfig => {
  // TS错误是否要抛出来。如果配了这个，那编译会很慢，而且页面会显示TS错误的信息，暂时先不开启。
  // webpackConfig.ts.transpileOnly = false;

  webpackConfig.resolve.root = [path.resolve(__dirname, './src')];

  webpackConfig.devtool = 'source-map';

  webpackConfig.externals = {
    antd: 'antd',
    lodash: '_',
    moment: 'moment',
    react: 'React',
    'react-dom': 'ReactDOM',
  };

  webpackConfig.plugins.push(
    failPlugin,
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new webpack.DefinePlugin({
      __TIME__: wrapStr(new Date().toLocaleString()),
      __DEV__: wrapStr('development'),
      __PROD__: wrapStr('production'),
    }),
    new CopyWebpackPlugin([
      { context: 'public', from: '*' },
      { from: 'libs', to: 'libs' },
    ])
  );

  return webpackConfig;
};
