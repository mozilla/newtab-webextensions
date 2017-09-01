const {GlobalOverrider, EventManager} = require("test/unit/utils.js");

const req = require.context(".", true, /\.test\.js?$/);
const files = req.keys();

// This exposes sinon assertions to chai.assert
sinon.assert.expose(assert, {prefix: ""});

let overrider = new GlobalOverrider();

overrider.set({
  Components: {
    classes: {},
    interfaces: {},
    utils: {
      import() {},
      importGlobalProperties() {},
      reportError() {},
      now: () => window.performance.now()
    },
    isSuccessCode: () => true
  },
  ExtensionAPI: class { constructor(extension) { this.extension = extension; } },
  EventManager
});

describe("newtab-webextensions", () => {
  after(() => overrider.restore());
  files.forEach(file => req(file));
});
