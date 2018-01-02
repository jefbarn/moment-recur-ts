import * as path from 'path'
import * as fs from 'fs'
import * as webpack from 'webpack'
import * as CleanWebpackPlugin from 'clean-webpack-plugin'
import * as prettier from 'prettier'

class DtsBundlePlugin implements webpack.Plugin {
  apply (compiler) {
    compiler.plugin('done', function () {
      let dts = require('dts-bundle')

      dts.bundle({
        name: 'moment',
        main: 'dist/types/index.d.ts',
        out: '../moment-recur-ts.d.ts',
        removeSource: true,
        outputAsModuleFolder: true
      })

      fs.rmdirSync(path.resolve(__dirname, '../dist/types'))

      let filename = path.resolve(__dirname, '../dist/moment-recur-ts.d.ts')
      fs.writeFileSync(filename, prettier.format(
        fs.readFileSync(filename, 'utf8'),
        {
          filepath: filename,
          semi: false,
          singleQuote: true
        }
      ).replace('moment/index//moment', 'moment'))
    })
  }
}

const config: webpack.Configuration = {
  entry: {
    'moment-recur-ts': './src/index.ts',
    'moment-recur-ts.min': './src/index.ts'
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'moment-recur-ts',
    umdNamedDefine: true
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  externals: {
    moment: 'moment'
  },
  devtool: 'source-map',
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      include: /\.min\.js$/
    }),
    // new DeclarationBundlerPlugin({
    //   moduleName: 'moment',
    //   out: 'moment-recur-ts.d.ts'
    // }),
    new DtsBundlePlugin(),

    new CleanWebpackPlugin(['../dist'], {
      allowExternal: true
    })
  ],
  module: {
    rules: [{
      test: /\.ts$/,
      loader: 'ts-loader',
      options: {
        onlyCompileBundledFiles: true,
        compilerOptions: {
          // outDir: 'es',
          declarationDir: 'types'
        }
      }
      // exclude: /node_modules/,
    }]
  }
}

export default config
