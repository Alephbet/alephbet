const coffee = require("coffeescript")

module.exports = {
  process: (src, path) => {
    const script = coffee.compile(src, {
      bare: true,
      sourceMap: true,
      transpile: {presets: ["@babel/preset-env"]}
    })
    return {
      code: script.js,
      map: script.v3SourceMap
    }
  }
}
