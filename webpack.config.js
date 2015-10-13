module.exports = {
  entry: './src/frontend/webpack-entry.js',
  output: {
    path: __dirname + '/src/frontend',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          stage: 0
        }
      }
    ]
  }
}
