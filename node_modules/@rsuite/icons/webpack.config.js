const path = require('path');
const webpack = require('webpack');
const HtmlwebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const markdownRenderer = require('react-markdown-reader').renderer;
const { NODE_ENV } = process.env;

const docsPath = NODE_ENV === 'development' ? './assets' : './';
const plugins = [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(NODE_ENV)
  }),
  new HtmlwebpackPlugin({
    title: 'RSUITE Table',
    filename: 'index.html',
    template: 'docs/index.html',
    inject: true,
    hash: true,
    path: docsPath
  }),
  new MiniCssExtractPlugin({
    filename: '[name].css',
    chunkFilename: '[id].css'
  })
];

module.exports = (env = {}) => {
  return {
    entry: './docs/index.tsx',
    devtool: 'source-map',
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json']
    },
    devServer: {
      hot: true,
      contentBase: path.resolve(__dirname, ''),
      publicPath: '/',
      disableHostCheck: true
    },
    output: {
      path: path.resolve(__dirname, 'assets'),
      filename: 'bundle.js',
      publicPath: './'
    },
    plugins,
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: ['babel-loader'],
          exclude: /node_modules/
        },
        {
          test: /\.(less|css)$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader
            },
            'css-loader',
            'less-loader?javascriptEnabled=true'
          ]
        },
        {
          test: /\.md$/,
          use: [
            {
              loader: 'html-loader'
            },
            {
              loader: 'markdown-loader',
              options: {
                pedantic: true,
                renderer: markdownRenderer()
              }
            }
          ]
        },
        {
          test: /\.(woff|woff2|eot|ttf|svg)($|\?)/,
          use: [
            {
              loader:
                'url-loader?limit=1&hash=sha512&digest=hex&size=16&name=resources/[hash].[ext]'
            }
          ]
        }
      ]
    }
  };
};
