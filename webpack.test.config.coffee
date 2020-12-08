webpackTapeRun = require("webpack-tape-run")
path = require("path")

module.exports =
  target: "web"
  mode: "development"
  entry: [
    "./test/alephbet_test.coffee"
    "./test/utils_test.coffee"
    "./test/adapters_test.coffee"
  ]
  node: false
  # fs: "empty"
  output:
    path: path.resolve(__dirname, "./test")
    filename: "bundle.js"
  watchOptions:
    ignored: /node_modules/
  devtool: "inline-source-map"
  resolve:
    modules: [
      "node_modules"
      "src"
    ]
    extensions: [
      ".js"
      ".coffee"
    ]
  plugins: [
    new webpackTapeRun(
      tapeRun: {}
      reporter: "tap-spec"
    )
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
