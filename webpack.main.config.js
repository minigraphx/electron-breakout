const rules = require("./webpack.rules");
rules.push({
  test: /\.(png|json)$/i,
  exclude: /(node_modules|\.webpack)/,
  type: 'asset/resource',
  generator: {
    filename: '[name].[ext]'
  }
});

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main/index.ts',
  // Put your normal webpack config below here
  module: {
    rules: require('./webpack.rules'),
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css']
  },
};