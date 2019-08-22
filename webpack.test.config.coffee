webpackTapeRun = require("webpack-tape-run")
path = require("path")

module.exports =
  target: "web"
  entry: [
    "./test/alephbet_test.coffee"
    "./test/utils_test.coffee"
    "./test/adapters_test.coffee"
  ]
  node:
    fs: "empty"
  output:
    path: path.resolve(__dirname, "./test")
    filename: "bundle.js"
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
      # reporter: "tap-spec"
    )
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
