"use strict";
const {GlobalOverrider, EventEmitter} = require("test/unit/utils.js");
const {API, ActivityStreamActions} = require("experiment/api.js");

/* eslint-disable max-nested-callbacks */
/* eslint-disable no-loop-func */
describe("Experiment", () => {
  let globals;
  let sectionsManagerStub;

  let instance;
  let FAKE_ID;
  let FAKE_EXTENSION;
  let FAKE_EXTENSION_PATH;

  beforeEach(() => {
    globals = new GlobalOverrider();
    sectionsManagerStub = {
      initialized: true,
      sections: new Map(),
      addSection: sinon.spy(),
      removeSection: sinon.spy(),
      enableSection: sinon.spy(),
      disableSection: sinon.spy(),
      updateSection: sinon.spy()
    };
    for (const action of [
      "ACTION_DISPATCHED",
      "ENABLE_SECTION",
      "DISABLE_SECTION",
      "INIT",
      "UNINIT"
    ]) {
      sectionsManagerStub[action] = action;
    }
    EventEmitter.decorate(sectionsManagerStub);
    globals.set("SectionsManager", sectionsManagerStub);

    FAKE_ID = "FAKE_ID";
    FAKE_EXTENSION_PATH = `moz-extension://some/path/here/to/${FAKE_ID}`;
    FAKE_EXTENSION = {
      id: "FAKE_ID",
      manifest: {},
      getURL: sinon.stub().callsFake(x => `${FAKE_EXTENSION_PATH}/${x}`)
    };

    instance = new API(FAKE_EXTENSION);
  });

  afterEach(() => {
    globals.restore();
  });

  describe("#constructor", () => {
    it("should set .sectionOptions to have sensible defaults", () => {
      const expectedOptions = {
        title: FAKE_ID,
        maxRows: 1,
        contextMenuOptions: [
          "OpenInNewWindow",
          "OpenInPrivateWindow",
          "Separator",
          "BlockUrl"
        ],
        emptyState: {message: "Loading"}
      };
      assert.deepEqual(instance.sectionOptions, expectedOptions);
    });
    it("should not override options with null", () => {
      const newOptions = {
        title: null,
        maxRows: null,
        emptyState: null
      };
      FAKE_EXTENSION.manifest.new_tab_section_options = newOptions;
      instance = new API(FAKE_EXTENSION);
      const options = instance.sectionOptions;
      assert.isNotNull(options.title);
      assert.isNotNull(options.maxRows);
      assert.isNotNull(options.emptyState);
    });
    it("should allow non-icon options to be overriden in the manifest", () => {
      const newOptions = {
        title: "SOME_NEW_TITLE",
        maxRows: 3,
        contextMenuOptions: ["BlockUrl"],
        emptyState: {message: "Also loading"},
        infoOption: {header: "Some header", link: {title: "Some link", href: "example.com"}}
      };
      FAKE_EXTENSION.manifest.new_tab_section_options = newOptions;
      instance = new API(FAKE_EXTENSION);
      for (const [prop, value] of Object.entries(newOptions)) {
        assert.deepEqual(instance.sectionOptions[prop], value);
      }
    });
    it("should allow icon options to be overriden in the manifest and wrap them with the extension url", () => {
      const newOptions = {
        icon: "some-icon.png",
        emptyState: {icon: "some-other-icon.jpg"}
      };
      const expectedOptions = Object.assign({}, newOptions);
      instance.wrapExtensionUrl(expectedOptions, "icon");
      instance.wrapExtensionUrl(expectedOptions.emptyState, "icon");
      FAKE_EXTENSION.manifest.new_tab_section_options = newOptions;
      instance = new API(FAKE_EXTENSION);
      const options = instance.sectionOptions;
      assert.equal(options.icon, expectedOptions.icon);
      assert.equal(options.emptyState.icon, expectedOptions.emptyState.icon);
    });
  });

  describe("#wrapExtensionUrl", () => {
    it("should do nothing if object prop is not a string", () => {
      const obj = {int: 10, obj: {}, arr: [1, "2", "three"]};
      let clone;
      for (const prop of ["undefined", "int", "obj", "arr"]) {
        clone = Object.assign({}, obj);
        instance.wrapExtensionUrl(clone, prop);
        assert.notCalled(FAKE_EXTENSION.getURL);
        assert.deepEqual(obj, clone);
      }
    });
    it("should prepend the extension's path to the prop", () => {
      const obj = {prop: "SOME_FILE.png"};
      instance.wrapExtensionUrl(obj, "prop");
      assert.calledOnce(FAKE_EXTENSION.getURL);
      assert.equal(obj.prop, `${FAKE_EXTENSION_PATH}/SOME_FILE.png`);
    });
  });

  describe("#onShutdown", () => {
    it("should call SectionsManager.removeSection with the extension id", () => {
      instance.onShutdown();
      assert.calledOnce(sectionsManagerStub.removeSection);
      assert.calledWith(sectionsManagerStub.removeSection, FAKE_ID);
    });
  });

  describe("#getAPI", () => {
    it("should return an object with a single prop `newTabSection`", () => {
      assert.deepEqual(Object.keys(instance.getAPI()), ["newTabSection"]);
    });

    describe("newTabSection", () => {
      let newTabSection;

      beforeEach(() => {
        newTabSection = instance.getAPI().newTabSection;
      });

      const newOptions = {
        title: "SOME_NEW_FAKE_TITLE",
        icon: "moz-extension://extension/path/SOME_FAKE_ICON.png",
        maxRows: 5,
        emptyState: {message: "SOME_MESSAGE", icon: "moz-extension://extension/path/SOME_OTHER_ICON.png"},
        infoOption: {header: "SOME_HEADER", body: "SOME_BODY", link: {href: "example.com", title: "example"}}
      };

      for (const prop of Object.keys(newOptions)) {
        const method = `set${prop.charAt(0).toUpperCase()}${prop.slice(1)}`;
        describe(`#${method}`, () => {
          it(`should set the ${prop} and call SectionsManager.updateSection`, () => {
            sectionsManagerStub.sections.set(FAKE_ID, {});
            newTabSection[method](newOptions[prop]);
            assert.deepEqual(instance.sectionOptions[prop], newOptions[prop]);
            assert.calledOnce(sectionsManagerStub.updateSection);
            assert.calledWith(sectionsManagerStub.updateSection, FAKE_ID, instance.sectionOptions, true);
          });
        });
      }

      describe("#enable", () => {
        it("should call SectionsManager.addSection, then SectionsManager.enableSection", () => {
          newTabSection.enable();
          assert.calledOnce(sectionsManagerStub.addSection);
          assert.calledWith(sectionsManagerStub.addSection, FAKE_ID, instance.sectionOptions);
          assert.calledOnce(sectionsManagerStub.enableSection);
          assert.calledWith(sectionsManagerStub.enableSection, FAKE_ID);
          assert.callOrder(sectionsManagerStub.addSection, sectionsManagerStub.enableSection);
        });
      });

      describe("#disable", () => {
        it("should call SectionsManager.removeSection", () => {
          newTabSection.disable();
          assert.calledOnce(sectionsManagerStub.removeSection);
          assert.calledWith(sectionsManagerStub.removeSection, FAKE_ID);
        });
      });

      describe("#addCards", () => {
        const FAKE_CARDS = [{url: "1.com"}, {url: "2.com"}, {url: "3.com"}];
        it("should call SectionsManager.updateSection if the section exists", () => {
          sectionsManagerStub.sections.set(FAKE_ID, {});
          newTabSection.addCards(FAKE_CARDS, true);
          assert.calledOnce(sectionsManagerStub.updateSection);
          assert.calledWith(sectionsManagerStub.updateSection, FAKE_ID, {rows: FAKE_CARDS}, true);
        });
        it("should do nothing if the section doesn't exist", () => {
          assert.equal(sectionsManagerStub.sections.size, 0);
          newTabSection.addCards(FAKE_CARDS);
          assert.notCalled(sectionsManagerStub.updateSection);
        });
      });

      describe("#onInitialized", () => {
        it("should fire immediately if the section is already enabled", async () => {
          sectionsManagerStub.sections.set(FAKE_ID, {enabled: true});
          const spy = sinon.spy();
          await newTabSection.onInitialized.addListener(spy);
          assert.calledOnce(spy);
          await newTabSection.onInitialized.removeListener(spy);
        });
        it("should not fire immediately if the section is not already enabled", async () => {
          sectionsManagerStub.sections.clear();
          const spy = sinon.spy();
          await newTabSection.onInitialized.addListener(spy);
          assert.notCalled(spy);
          await newTabSection.onInitialized.removeListener(spy);
        });
        it("should fire when SectionsManager initialises and the section is already enabled", async () => {
          sectionsManagerStub.initialized = false;
          const spy = sinon.spy();
          await newTabSection.onInitialized.addListener(spy);
          sectionsManagerStub.initialized = true;
          sectionsManagerStub.sections.set(FAKE_ID, {enabled: true});
          await sectionsManagerStub.emit(sectionsManagerStub.INIT);
          assert.calledOnce(spy);
          await newTabSection.onInitialized.removeListener(spy);
        });
        it("should fire on an ENABLE_SECTION action with the correct id", async () => {
          const spy = sinon.spy();
          await newTabSection.onInitialized.addListener(spy);
          await sectionsManagerStub.emit(sectionsManagerStub.ENABLE_SECTION, "INCORRECT_ID");
          assert.notCalled(spy);
          await sectionsManagerStub.emit(sectionsManagerStub.ENABLE_SECTION, FAKE_ID);
          assert.calledOnce(spy);
          await newTabSection.onInitialized.removeListener(spy);
        });
      });

      describe("#onUninitialized", () => {
        it("should fire when SectionsManager uninitialises", async () => {
          const spy = sinon.spy();
          await newTabSection.onUninitialized.addListener(spy);
          sectionsManagerStub.initialized = false;
          await sectionsManagerStub.emit(sectionsManagerStub.UNINIT);
          assert.calledOnce(spy);
          await newTabSection.onUninitialized.removeListener(spy);
        });
        it("should fire on a DISABLE_SECTION action with the correct id", async () => {
          const spy = sinon.spy();
          await newTabSection.onUninitialized.addListener(spy);
          await sectionsManagerStub.emit(sectionsManagerStub.DISABLE_SECTION, "INCORRECT_ID");
          assert.notCalled(spy);
          await sectionsManagerStub.emit(sectionsManagerStub.DISABLE_SECTION, FAKE_ID);
          assert.calledOnce(spy);
          await newTabSection.onUninitialized.removeListener(spy);
        });
      });

      describe("#onAction", () => {
        it("should fire on an ACTION_DISPATCHED action and pass the right arguments", async () => {
          const spy = sinon.spy();
          await newTabSection.onAction.addListener(spy);
          const FAKE_ACTION = "SYSTEM_TICK";
          const FAKE_DATA = {here: 15, some: {fake: "data"}};
          await sectionsManagerStub.emit(sectionsManagerStub.ACTION_DISPATCHED, FAKE_ACTION, FAKE_DATA);
          assert.calledOnce(spy);
          assert.calledWith(spy, ActivityStreamActions[FAKE_ACTION], FAKE_DATA);
          await newTabSection.onAction.removeListener(spy);
        });
      });

      for (const action of Object.keys(ActivityStreamActions)) {
        describe(`#on${ActivityStreamActions[action]}`, () => {
          it(`should fire on when ${action} is received`, async () => {
            const spy = sinon.spy();
            await newTabSection[`on${ActivityStreamActions[action]}`].addListener(spy);
            const FAKE_DATA = {here: 15, some: {fake: "data"}};
            await sectionsManagerStub.emit(sectionsManagerStub.ACTION_DISPATCHED, action, FAKE_DATA);
            assert.calledOnce(spy);
            assert.calledWith(spy, FAKE_DATA);
            await newTabSection[`on${ActivityStreamActions[action]}`].removeListener(spy);
          });
        });
      }
    });
  });
});
