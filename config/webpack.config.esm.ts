import * as path from 'path'
import * as webpack from 'webpack'
import * as CleanWebpackPlugin from 'clean-webpack-plugin'

const config: webpack.Configuration = {
  entry: {
    'moment-recur-ts': './src/index.ts',
    'moment-recur-ts.min': './src/index.ts',
  },
  output: {
    path: path.resolve(__dirname, '../dist/umd'),
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
    new CleanWebpackPlugin(['umd'])
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
