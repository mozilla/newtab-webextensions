const path = require("path");

module.exports = function(config) {
  config.set({
    singleRun: !config.tdd,
    failOnEmptyTestSuite: false,
    browsers: ["Firefox"],
    frameworks: ["mocha", "sinon", "chai"],
    files: [path.resolve(__dirname, "test/unit/unit-entry.js")],
    reporters: ["mocha", "coverage"],
    coverageReporter: {
      dir: "logs/coverage",
      // This will make karma fail if coverage reporting is less than the minimums here
      check: !config.tdd && {
        global: {
          statements: 100,
          lines: 100,
          functions: 100,
          branches: 90
        }
      },
      reporters: [
        {type: "html", subdir: "report-html"},
        {type: "text", subdir: ".", file: "text.txt"},
        {type: "text-summary", subdir: ".", file: "text-summary.txt"}
      ]
    },
    preprocessors: {"test/unit/**/*.js": ["webpack", "sourcemap"]},
    webpack: {
      devtool: "inline-source-map",
      resolve: {
        extensions: ["test.js"],
        modules: [__dirname]
      },
      module: {
        rules: [
          {
            enforce: "post",
            test: /\.js?$/,
            loader: "istanbul-instrumenter-loader",
            include: [__dirname],
            exclude: [
              path.resolve("test/"),
              path.resolve("node_modules/")
            ]
          }
        ]
      }
    },
    webpackMiddleware: {noInfo: true},
    colors: true
  });
};
