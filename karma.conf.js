// Karma configuration
// Generated on Thu Jul 20 2017 17:09:01 GMT-0400 (EDT)

module.exports = function(config) {
  config.set({
    singleRun: !config.tdd,
    failOnEmptyTestSuite: false,
    browsers: ["Firefox"],
    frameworks: ["mocha"],
    files: [
      "experiment/test/**/*.js",
      "extension/test/**/*.js"
    ],
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
    colors: true,
    logLevel: config.LOG_INFO
  });
};
