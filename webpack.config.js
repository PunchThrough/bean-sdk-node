module.exports = {
  entry: './app/render.jsx',
  output: {
    path: __dirname + '/build/',
    filename: 'bundle.js'
  },
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          stage: 0
        }
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.node$/,
        loader: 'node'
      }
    ]
  },
  //externals: {
  //  'bluetooth-hci-socket': 'bluetooth-hci-socket',
  //  'fs': 'fs'
  //}
}
