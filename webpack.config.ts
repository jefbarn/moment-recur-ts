import CleanWebpackPlugin from 'clean-webpack-plugin'
import * as dts from 'dts-bundle'
import * as fs from 'fs'
import * as path from 'path'
import * as prettier from 'prettier'
import UglifyJsPlugin from 'uglifyjs-webpack-plugin'
import * as webpack from 'webpack'

class DtsBundlePlugin implements webpack.Plugin {
  public apply (compiler: any): void {
    compiler.hooks.done.tap('DtsBundlePlugin', () => {
      // let dts = require('dts-bundle')

      dts.bundle({
        name: 'moment',
        main: 'dist/types/index.d.ts',
        out: '../moment-recur-ts.d.ts',
        removeSource: true
        // outputAsModuleFolder: true
      })

      fs.rmdirSync(path.resolve(__dirname, './dist/types'))

      const filename = path.resolve(__dirname, './dist/moment-recur-ts.d.ts')
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
  mode: 'production',
  entry: {
    'moment-recur-ts': './src/index.ts',
    'moment-recur-ts.min': './src/index.ts'
  },
  output: {
    path: path.resolve(__dirname, './dist'),
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
  // optimization: {
  //   minimize: true
  // },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        sourceMap: true,
        include: /\.min\.js$/
      })
    ]
  },
  plugins: [
    // new webpack.optimize.UglifyJsPlugin({
    //   sourceMap: true,
    //   include: /\.min\.js$/
    // }),
    // new DeclarationBundlerPlugin({
    //   moduleName: 'moment',
    //   out: 'moment-recur-ts.d.ts'
    // }),
    new DtsBundlePlugin(),

    new CleanWebpackPlugin(['./dist'], {
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
