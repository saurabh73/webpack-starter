const path = require('path');
const webpack = require('webpack');
const glob = require('glob');
/* Webpack Plugins */
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const PreloadWebpackPlugin = require('preload-webpack-plugin');
const CssUrlRelativePlugin = require('css-url-relative-plugin');
const PurgeCssPlugin = require('purgecss-webpack-plugin');
const AutoPrefixer = require('autoprefixer');

/* Environment */
const IS_DEV = process.env.NODE_ENV !== 'production';

const pages = ['index', 'about'];

const entryHtmlPlugins = pages.map(page => {
  return new HtmlWebpackPlugin({
    filename: `${page}.html`,
    template: `src/${page}.html`,
    favicon: path.resolve(__dirname, './src/favicon.ico'),
    minify: !IS_DEV && {
      collapseWhitespace: true,
      preserveLineBreaks: true,
      removeComments: true,
    },
  });
});

const config = {
  mode: IS_DEV ? 'development' : 'production',
  devtool: !IS_DEV ? 'eval' : 'source-map',
  entry: {
    main: ['./src/scripts/script.js', './src/styles/style.scss'],
  },
  output: {
    filename: 'scripts/[name].[hash].js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    contentBase: path.join(__dirname, 'src'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.scss$/,
        use: [
          IS_DEV ? 'style-loader' : MiniCssExtractPlugin.loader,
          { loader: 'css-loader', options: { sourceMap: IS_DEV } },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: [
                AutoPrefixer({
                  browsers: ['> 1%', 'last 2 versions'],
                }),
              ],
            },
          },
          { loader: 'sass-loader', options: { sourceMap: IS_DEV } },
        ],
      },
      {
        test: /\.css$/,
        use: [
          IS_DEV ? 'style-loader' : MiniCssExtractPlugin.loader,
          { loader: 'css-loader', options: { sourceMap: IS_DEV } },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: [
                AutoPrefixer({
                  browsers: ['> 1%', 'last 2 versions'],
                }),
              ],
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 8192,
            name: '[name].[ext]',
            fallback: 'file-loader',
            outputPath: 'assets/images/',
            publicPath: 'assets/images/',
          },
        },
      },
      {
        test: /\.woff(2)?(\?v=[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{1,2})?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          mimetype: 'application/font-woff',
          name: '[name].[ext]',
          outputPath: 'assets/fonts/',
          publicPath: 'assets/fonts/',
        },
      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{1,2})?$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'assets/fonts/',
          publicPath: 'assets/fonts/',
        },
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: {
              minimize: !IS_DEV,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'windows.jQuery': 'jquery',
    }),
    new MiniCssExtractPlugin({
      filename: IS_DEV
        ? 'styles/[name].css'
        : 'styles/[name].[contenthash].css',
      chunkFilename: 'styles/[name]-[contenthash]-[id].css',
    }),
    new PreloadWebpackPlugin({
      include: 'initial',
    }),
    new PurgeCssPlugin({
      paths: glob.sync(path.resolve(__dirname, 'src') + '/**/*', {
        nodir: true,
      }),
    }),
    new CssUrlRelativePlugin(),
    new webpack.HashedModuleIdsPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
  ].concat(entryHtmlPlugins),
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          chunks: 'initial',
          name: 'vendor',
          priority: 10,
          enforce: true,
        },
      },
    },
    minimizer: [],
  },
};

if (!IS_DEV) {
  config.optimization.minimizer.push(
    new UglifyJsPlugin({
      sourceMap: false,
    }),
    new OptimizeCSSAssetsPlugin({})
  );
}

module.exports = config;
