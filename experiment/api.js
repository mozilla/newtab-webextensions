/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const {utils: Cu} = Components;
Cu.import("resource://activity-stream/lib/SectionsManager.jsm");
Cu.import("resource://gre/modules/ExtensionCommon.jsm");

// Give ActivityStream actions names that are more consistent with webextension
// event names. Actions added here must also be added to the schema.
const ActivityStreamActions = {
  SYSTEM_TICK: "SystemTick",
  NEW_TAB_LOAD: "NewTabOpened"
};

class API extends ExtensionAPI { // eslint-disable-line no-unused-vars
  constructor(extension) {
    super(extension);

    const manifestOptions = Object.assign({},
      this.extension.manifest.new_tab_section_options);

    for (const prop in manifestOptions) {
      // Necessary to avoid overwriting default values with null if no option is
      // provided in the manifest
      if (manifestOptions[prop] === null) { delete manifestOptions[prop]; }
    }

    this.sectionOptions = Object.assign({
      title: this.extension.id,
      maxRows: 1,
      contextMenuOptions: [
        "OpenInNewWindow",
        "OpenInPrivateWindow",
        "Separator",
        "BlockUrl"
      ],
      emptyState: {message: "Loading"}
    }, manifestOptions);

    this.wrapExtensionUrl(this.sectionOptions, "icon");
    this.wrapExtensionUrl(this.sectionOptions.emptyState, "icon");
  }

  wrapExtensionUrl(object, prop) {
    if (typeof object[prop] === "string" && !object[prop].startsWith("moz-extension://")) {
      object[prop] = this.extension.getURL(object[prop]);
    }
  }

  onShutdown() {
    SectionsManager.removeSection(this.extension.id);
  }

  getAPI(context) {
    const id = this.extension.id;
    const options = this.sectionOptions;

    // If we dynamically update a section option, propagate the change to
    // Activity Stream
    const onUpdateOption = () =>
      SectionsManager.sections.has(id) &&
      SectionsManager.updateSection(id, options, true);

    const newTabSection = {
      setTitle(title) {
        options.title = title;
        onUpdateOption();
      },

      setIcon(icon) {
        options.icon = icon;
        onUpdateOption();
      },

      setMaxRows(maxRows) {
        options.maxRows = maxRows;
        onUpdateOption();
      },

      setEmptyState(emptyState) {
        options.emptyState = emptyState;
        onUpdateOption();
      },

      setInfoOption(infoOption) {
        options.infoOption = infoOption;
        onUpdateOption();
      },

      // Terminology: in ActivityStream the `enabled` property toggles section
      // visibility, allowing the user to hide sections they don't want to see
      // (but the section is still there and will be shown in the pref pane).
      // Here we use "enable" to mean "add the section to ActivityStream and
      // then set `enabled` to be true". The second step is a workaround until
      // ActivityStream is responsible for setting the `enabled` property based
      // on whether the user had hidden the extension in the previous session.
      enable() {
        SectionsManager.addSection(id, options);
        SectionsManager.enableSection(id);
      },

      disable() {
        SectionsManager.removeSection(id);
      },

      addCards(cards, shouldBroadcast = false) {
        if (SectionsManager.sections.has(id)) {
          SectionsManager.updateSection(id, {rows: cards}, shouldBroadcast);
        }
      },

      // Fired when the section is enabled
      onInitialized: new EventManager(context, "newTabSection.onInitialized", fire => {
        // Either SectionsManager gets (re-)initialised with the section already
        // registered and enabled, or the section gets enabled through user action.
        const initListener = () =>
          SectionsManager.sections.has(id) &&
          SectionsManager.sections.get(id).enabled &&
          fire.async();
        const enabledListener = (_, enabledSection) =>
          enabledSection === id && fire.async();

        // If SectionsManager is already initialised and the section is enabled
        // we should fire immediately
        if (SectionsManager.initialized) { initListener(); }

        SectionsManager.on(SectionsManager.INIT, initListener);
        SectionsManager.on(SectionsManager.ENABLE_SECTION, enabledListener);

        return () => {
          SectionsManager.off(SectionsManager.INIT, initListener);
          SectionsManager.off(SectionsManager.ENABLE_SECTION, enabledListener);
        };
      }).api(),

      // Fired when the section is disabled
      onUninitialized: new EventManager(context, "newTabSection.onUninitialized", fire => {
        // Either SectionsManager gets uninitialised or the section gets
        // disabled through user action.
        const uninitListener = () => fire.async();
        const disabledListener = (_, disabledSection) =>
          disabledSection === id && fire.async();

        SectionsManager.on(SectionsManager.UNINIT, uninitListener);
        SectionsManager.on(SectionsManager.DISABLE_SECTION, disabledListener);

        return () => {
          SectionsManager.off(SectionsManager.UNINIT, uninitListener);
          SectionsManager.off(SectionsManager.DISABLE_SECTION, disabledListener);
        };
      }).api(),

      // All actions event
      onAction: new EventManager(context, "newTabSection.onAction", fire => {
        const listener = (event, type, data) =>
          fire.async(ActivityStreamActions[type], data);
        SectionsManager.on(SectionsManager.ACTION_DISPATCHED, listener);
        return () =>
          SectionsManager.off(SectionsManager.ACTION_DISPATCHED, listener);
      }).api()
    };

    // Constructs an EventManager for a single action
    const ActionEventManagerFactory = action => {
      const key = `newTabSection.on${ActivityStreamActions[action]}`;
      return new EventManager(context, key, fire => {
        const listener = (event, type, data) =>
          type === action && fire.async(data);
        SectionsManager.on(SectionsManager.ACTION_DISPATCHED, listener);
        return () =>
          SectionsManager.off(SectionsManager.ACTION_DISPATCHED, listener);
      }).api();
    };

    // Single action events
    for (const action of Object.keys(ActivityStreamActions)) {
      const key = `on${ActivityStreamActions[action]}`;
      newTabSection[key] = ActionEventManagerFactory(action);
    }

    return {newTabSection};
  }
}

this.ActivityStreamActions = ActivityStreamActions;
this.API = API;
this.EXPORTED_SYMBOLS = ["ActivityStreamActions", "API"];
