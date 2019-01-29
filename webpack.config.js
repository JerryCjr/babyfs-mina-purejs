const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const config = {
  output: {
    path: path.resolve(__dirname, 'miniprogram_dist'),
    filename: 'index.js',
    libraryTarget: 'commonjs2'
  },
  devtool: 'source-map',
  module: {
    rules: [{
      enforce: 'pre',
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      use: 'eslint-loader'
    }]
  },
  optimization: {
    minimizer: [
      (compiler) => {
        // console.log('__compiler.options.optimization: ', compiler.options.optimization);
        new TerserPlugin({
          test: /\.js(\?.*)?$/i,
          include: 'index.js',
          sourceMap: true,
          terserOptions: {
            // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
            extractComments: 'all',
            compress: false,
            mangle: {
              reserved: ['regeneratorRuntime']
            }
          }
        }).apply(compiler);
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['miniprogram_dist'])
  ]
};

module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    config.watch = true;
  }

  if (argv.mode === 'production') {
    config.watch = false;
    config.watchOptions = {
      ignored: /node_modules/
    };
    // console.log('__config.optimization: ', config.optimization);
  }

  return config;
};
