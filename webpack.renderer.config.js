const rules = require('./webpack.rules');

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules,
  },
  externals: {
    electron: 'commonjs electron',
  },
  resolve: {
    fallback: {
      fs: false,
      path: false,
    },
  },
};
