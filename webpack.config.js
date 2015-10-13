module.exports = {
  entry: './app/app.jsx',
  output: {
    path: __dirname + '/build/',
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
