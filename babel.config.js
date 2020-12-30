module.exports = (api) => {
  api.cache(true)
  return {
    presets: ["@babel/preset-env"],
    plugins: [
      // transforms object?.method?.method
      "@babel/plugin-proposal-optional-chaining",
      // transforms Object.assign(a, b) to an implementation for all browsers
      "@babel/plugin-transform-object-assign",
      // allows us to write class instance variables
      "@babel/plugin-proposal-class-properties"
    ],
    env: {
      commonjs: {
        presets: [
          ["@babel/preset-env", {targets: {node: "8"}, modules: "commonjs"}]
        ]
      },
      esm: {
        presets: [["@babel/preset-env", {modules: false}]]
      }
    }
  }
}
