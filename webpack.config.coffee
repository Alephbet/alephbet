path = require("path")
BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin

file_name = (mode) ->
  if mode == "production"
    "alephbet.min.js"
  else
    "alephbet.js"

module.exports = (env, argv) ->
  target: "web"
  mode: "production"
  entry: "./src/alephbet.coffee"
  output:
    filename: file_name(argv.mode)
    path: path.resolve(__dirname, "dist")
    library:
      name: "AlephBet"
      type: "umd"
  watchOptions:
    ignored: /node_modules/
  devtool: "inline-source-map"
  resolve:
    modules: [
      "src"
      "node_modules"
    ]
    extensions: [
      ".coffee"
      ".js"
    ]
  module:
    rules: [
      test: /\.coffee$/
      use: [
        loader: "coffee-loader"
        options:
          transpile:
            presets: [
              ["@babel/preset-env", {modules: false}]
            ]
      ]
    ]
