// Karma configuration

import { Config } from 'karma'

declare module 'karma' {
  interface ConfigOptions {
    karmaTypescriptConfig?: any
    // concurrency?: number
    polyfill?: string[]
  }
}

export = (config: Config) => {

  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'chai', 'karma-typescript'],

    // list of files / patterns to load in the browser
    files: [
      { pattern: 'test/base.spec.ts' },
      // 'test/**/*.ts',
      { pattern: 'src/**/*.ts' },
      // 'node_modules/ix/**/*.ts',
      // { pattern: 'node_modules/ix/Ix.es2015.min.js' }
      // { pattern: 'node_modules/ix/Ix.js', included: false }
    ],

    // polyfill: [
    //   'es2015', 'es2016'
    // ],
    // polyfill: [
    //   'Promise',
    //   'Symbol',
    //   'Number.isInteger',
    //   'Object.entries', 'Object.values',
    //   'Array.prototype.includes', 'Array.prototype.find', 'Array.prototype.findIndex'
    // ],

    // list of files to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      // 'src/**/*.ts': ['karma-typescript', 'coverage'],
      // 'test/**/*.ts': ['karma-typescript'],
      '**/*.ts': ['karma-typescript']
    },

    karmaTypescriptConfig: {
      // compilerOptions: {
        // allowJs: true,
        // target: 'ES5',
        // lib: ['ES2015', 'dom']
        // "include": [
        //   "src/**/*.js", // added
        //   "src/**/*.ts"
        // ],
      // },
      // include: ['node_modules\\ix\\**\\*.ts'],
      tsconfig: './tsconfig.json',
      entrypoints: /\.spec\.ts$/
      // bundlerOptions: {
      //   resolve: {
      //     directories: ['node_modules'],
      //     alias: {
      //       'ix': 'node_modules/ix/Ix.es2015.min.js'
      //     }
      //   }
      // }
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'karma-typescript'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome', 'Firefox', 'Edge', 'IE'],
    // browsers: ['ChromeHeadless', 'FirefoxHeadless'],
    // browsers: ['Chrome'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
