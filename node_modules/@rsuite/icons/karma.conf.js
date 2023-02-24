const webpackConfig = {
  mode: 'development',
  output: {
    pathinfo: true
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      {
        test: [/\.tsx?$/, /\.jsx?$/],
        use: ['babel-loader?babelrc'],
        exclude: /node_modules/
      }
    ]
  },
  devtool: 'eval'
};

module.exports = config => {
  const { env } = process;
  const { M, F } = env;
  let testFile = 'test/index.js';

  if (M) {
    testFile = `test/${M}Spec.js`;
  } else if (F) {
    testFile = F;
  }

  config.set({
    basePath: '',
    files: [testFile],
    frameworks: ['mocha', 'sinon-chai'],
    processKillTimeout: 20000,
    colors: true,
    reporters: ['mocha', 'coverage'],

    logLevel: config.LOG_INFO,
    preprocessors: {
      'test/index.js': ['webpack', 'coverage']
    },
    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true
    },
    browsers: env.BROWSER ? env.BROWSER.split(',') : ['Chrome'],
    customLaunchers: {
      ChromeCi: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },
    coverageReporter: {
      dir: 'coverage',
      reporters: [
        { type: 'html' },
        { type: 'lcov', subdir: 'lcov' } // lcov
      ]
    }
  });
};
