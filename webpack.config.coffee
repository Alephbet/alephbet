path = require("path")

file_name = (mode) ->
  if mode == "production"
    "alephbet.min.js"
  else
    "alephbet.js"

source_map = (mode) ->
  if mode == "production"
    false
  else
    "inline-source-map"

module.exports = (env, argv) ->
  target: "web"
  entry: "./src/alephbet.coffee"
  output:
    filename: file_name(argv.mode)
    path: path.resolve(__dirname, "dist")
    library: "AlephBet"
    libraryTarget: "umd"
  watchOptions:
    ignored: [
      /node_modules/
    ]
  devtool: source_map(argv.mode)
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
            presets: [ "@babel/preset-env" ]
      ]
    ]
