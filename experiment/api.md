## API methods

Method | Parameters | Description
--- | --- | ---
`setTitle` | `title`: a non-empty string | Set the section title. Defaults to the extension id.
`setIcon` | `icon`: a path to an icon, relative to the extension manifest | Set the section icon. Defaults to a webextension icon.
`setMaxRows` | `maxRows`: a strictly positive integer | Set the (maximum) number of rows of cards to display in the section. Defaults to 1.
`setEmptyState` | `emptyState`: an `EmptyState` object | Set the empty state.
`setInfoOption` | `infoOption`: an `InfoOption` object | Set the info option.
`enable` | | Add the section to the new tab page.
`disable` | | Remove the section from the new tab page.
`addCards` | `cards`: an array of `Card` objects | Add cards for the section to display.

## API events

Event | Parameters | Description
--- | --- | ---
`onInitialized` | | Fired when the section is added or re-enabled.
`onUninitialized` | | Fired when the section is removed or disabled.
`onAction` | `action`: the name of the action<br/>`data`: any data associated with the action | Fired when any whitelisted ActivityStream action is received.
`onSystemTick` | | Fired on the ActivityStream system-tick event at a set interval (currently every five minutes).
`onNewTabOpened` | | Fired when a new tab is opened.

## Types

### EmptyState

Field | Type | Optional | Description
--- | --- | --- | ---
icon | string | true | A path to an icon, relative to the extension manifest.
message | string | true | A message to display.

### InfoOption

Field | Type | Optional | Description
--- | --- | --- | ---
header | string | true | The header title.
body | string | true | The body text.
link | `Link` object | true | A link to display at the bottom.

### Link
Field | Type | Optional | Description
--- | --- | --- | ---
href | string | false | The url for the link.
title | string | false | The text of the link.

### Card

Field | Type | Optional | Description
--- | --- | --- | ---
url | string | true | A url for the card to link to.
title | string | false | The title of the card.
description | string | true | The body text of the card.
hostname | string | true | The hostname to display above the title.
type | string | true | The context label to display at the bottom of the card.
image | string | true | A url for the card image.
context_menu_options | array[string] | true | The context menu options for the card.
