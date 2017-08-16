/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const {utils: Cu} = Components;
const {SectionsManager} = Cu.import("resource://activity-stream/lib/SectionsManager.jsm", {});
const {EventManager} = Cu.import("resource://gre/modules/ExtensionCommon.jsm", {});

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
      if (manifestOptions[prop] === null) { manifestOptions[prop] = undefined; }
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
      emptyState: {
        message: {defaultMessage: "Loading"},
        icon: "check"
      }
    }, manifestOptions);

    if (this.sectionOptions.icon && !this.sectionOptions.icon.startsWith("moz-extension://")) {
      this.sectionOptions.icon = this.extension.getURL(this.sectionOptions.icon);
    }
  }

  onShutdown() {
    SectionsManager.removeSection(this.extension.id);
  }

  getAPI(context) {
    const id = this.extension.id;
    const options = this.sectionOptions;

    // If we dynamically update a section option, calling enable again will
    // propagate the change to all existing section instances
    const onUpdateOption = () => {
      // eslint-disable-next-line no-use-before-define
      if (SectionsManager.sections.has(id)) { newTabContent.enableSection(); }
    };

    const newTabContent = {
      setTitle(title) {
        options.title = title;
        onUpdateOption();
      },

      setIcon(icon) {
        options.icons = icon;
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

      enableSection() {
        if (SectionsManager.initialized) {
          SectionsManager.addSection(id, options);
        }
      },

      disableSection() {
        SectionsManager.removeSection(id);
      },

      addCards(cards, shouldBroadcast = false) {
        if (SectionsManager.sections.has(id)) {
          SectionsManager.updateRows(id, cards, shouldBroadcast);
        }
      },

      //  ActivityStream's SectionFeed enabled event
      onInitialized: new EventManager(context, "newTabContent.onInitialized", fire => {
        // If already enabled, fire once
        if (SectionsManager.initialized) { fire.async(); }
        const listener = () => fire.async();
        SectionsManager.on(SectionsManager.INIT, listener);
        return () => SectionsManager.off(SectionsManager.INIT, listener);
      }).api(),

      // ActivityStream's SectionFeed disabled event
      onUninitialized: new EventManager(context, "newTabContent.onUninitialized", fire => {
        const listener = () => fire.async();
        SectionsManager.on(SectionsManager.UNINIT, listener);
        return () => SectionsManager.off(SectionsManager.UNINIT, listener);
      }).api(),

      // All actions event
      onAction: new EventManager(context, "newTabContent.onAction", fire => {
        const listener = (event, type, data) =>
          fire.async(ActivityStreamActions[type], data);
        SectionsManager.on(SectionsManager.ACTION_DISPATCHED, listener);
        return () =>
          SectionsManager.off(SectionsManager.ACTION_DISPATCHED, listener);
      }).api()
    };

    // Constructs an EventManager for a single action
    const ActionEventManagerFactory = action => {
      const key = `newTabContent.on${ActivityStreamActions[action]}`;
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
      newTabContent[key] = ActionEventManagerFactory(action);
    }

    return {newTabContent};
  }
}
