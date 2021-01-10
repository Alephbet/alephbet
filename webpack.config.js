const path = require("path")

module.exports = {
  target: "web",
  mode: "production",
  entry: "./src/alephbet.js",
  output: {
    filename: "alephbet.min.js",
    path: path.resolve(__dirname, "dist"),
    library: "AlephBet",
    libraryTarget: "umd",
    umdNamedDefine: true
  },
  watchOptions: {
    ignored: /node_modules/
  },
  devtool: "source-map",
  optimization: {
    minimize: false
  },
  resolve: {
    modules: [
      "src",
      "node_modules"
    ],
    extensions: [
      ".js"
    ]
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: ["babel-loader"]
      }
    ]
  }
}
