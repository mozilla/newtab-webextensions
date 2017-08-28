# newtab-webextensions

A WebExtensions experiment to add custom sections to the Activity Stream version
of the new tab page, and some example extensions consuming the API.

## Install and run

The experiment depends on Activity Stream being present in Firefox. Updates may
depend on ongoing Activity Stream development, so it's recommended to use an up
to date version of Firefox Nightly.

As the experiment is a legacy bootstrapped addon, the
`extensions.legacy.enabled` pref must be set to `true` in `about:config`.

Both the experiment and any consumer extensions can be installed as temporary
addons in `about:debugging`: open any file in the relevant experiment or
extension directory from the install dialog. The experiment must be installed
before any consumer extension.
