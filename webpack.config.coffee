path = require("path")

module.exports =
  target: "web"
  mode: "production"
  entry: "./src/alephbet.coffee"
  output:
    filename: "alephbet.js"
    path: path.resolve(__dirname, "dist")
    library: "AlephBet"
    libraryTarget: "umd"
  watchOptions:
    ignored: /node_modules/
  devtool: "source-map"
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
              ["@babel/preset-env"]
            ]
      ]
    ]
