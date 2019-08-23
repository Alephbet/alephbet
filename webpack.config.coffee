path = require("path")

file_name = (mode) ->
  if mode == "production"
    "alephbet.min.js"
  else
    "alephbet.js"

module.exports = (env, argv) ->
  target: "web"
  node:
    fs: "empty"
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
            plugins: [ "@babel/plugin-syntax-dynamic-import" ]
            presets: [ "@babel/preset-env" ]
      ]
    ]
