module.exports = {
  // When adding items to this file please check for effects on sub-directories.
  "env": {
    "mocha": true,
    "node": true
  },
  "globals": {
    "__CONFIG__": true,
    "platform_exports": true,
    "platform_require": true,
    "assert": true,
    "sinon": true,
    "browser": true,
    "API": true,
    "ExtensionAPI": true,
    "EventManager": true
  },
  "plugins": [
    "json",
    "promise"
  ],
  "extends": [
    "eslint:recommended",
    "plugin:mozilla/recommended"
  ],
  "rules": {
    "promise/param-names": 2,
    "promise/catch-or-return": 2,

    "accessor-pairs": [2, {"setWithoutGet": true, "getWithoutSet": false}],
    "array-bracket-spacing": [2, "never"],
    "array-callback-return": 2,
    "arrow-body-style": [2, "as-needed"],
    "arrow-parens": [2, "as-needed"],
    "block-scoped-var": 2,
    "callback-return": 0,
    "camelcase": 0,
    "comma-dangle": [2, "never"],
    "comma-style": 2,
    "consistent-this": [2, "use-bind"],
    "constructor-super": 2,
    "curly": [2, "all"],
    "default-case": 0,
    "dot-location": [2, "property"],
    "dot-notation": 2,
    "eqeqeq": 2,
    "func-names": 0,
    "func-style": 0,
    "generator-star-spacing": [2, {"before": false, "after": false}],
    "global-require": 0,
    "guard-for-in": 2,
    "handle-callback-err": 2,
    "id-blacklist": 0,
    "id-length": 0,
    "id-match": 0,
    "indent": [2, 2, {"SwitchCase": 1}],
    "init-declarations": 0,
    "lines-around-comment": [2, {"beforeBlockComment": true, "allowObjectStart": true}],
    "max-depth": [2, 4],
    "max-len": 0,
    "max-lines": 0,
    "max-nested-callbacks": [2, 4],
    "max-params": [2, 6],
    "max-statements": [2, 50],
    "max-statements-per-line": [2, {"max": 2}],
    "multiline-ternary": 0,
    "new-cap": [2, {"newIsCap": true, "capIsNew": false}],
    "new-parens": 2,
    "newline-after-var": 0,
    "newline-before-return": 0,
    "newline-per-chained-call": [2, {"ignoreChainWithDepth": 3}],
    "no-alert": 2,
    "no-array-constructor": 2,
    "no-bitwise": 0,
    "no-caller": 2,
    "no-case-declarations": 2,
    "no-catch-shadow": 2,
    "no-class-assign": 2,
    "no-confusing-arrow": [2, {"allowParens": true}],
    "no-console": 1,
    "no-const-assign": 2,
    "no-constant-condition": 2,
    "no-continue": 0,
    "no-control-regex": 2,
    "no-div-regex": 2,
    "no-dupe-class-members": 2,
    "no-duplicate-imports": 2,
    "no-empty-function": 0,
    "no-eq-null": 2,
    "no-eval": 2,
    "no-extend-native": 2,
    "no-extra-label": 2,
    "no-extra-parens": 0,
    "no-fallthrough": 2,
    "no-floating-decimal": 2,
    "no-implicit-coercion": [2, {"allow": ["!!"]}],
    "no-implicit-globals": 2,
    "no-implied-eval": 2,
    "no-inline-comments": 0,
    "no-inner-declarations": 2,
    "no-invalid-this": 0,
    "no-label-var": 2,
    "no-loop-func": 2,
    "no-magic-numbers": 0,
    "no-mixed-operators": [2, {"allowSamePrecedence": true, "groups": [["&", "|", "^", "~", "<<", ">>", ">>>"], ["==", "!=", "===", "!==", ">", ">=", "<", "<="], ["&&", "||"], ["in", "instanceof"]]}],
    "no-mixed-requires": 2,
    "no-multi-str": 2,
    "no-multiple-empty-lines": [2, {"max": 1, "maxBOF": 0, "maxEOF": 0}],
    "no-negated-condition": 0,
    "no-negated-in-lhs": 2,
    "no-new": 2,
    "no-new-func": 2,
    "no-new-require": 2,
    "no-new-symbol": 2,
    "no-new-wrappers": 2,
    "no-octal-escape": 2,
    "no-param-reassign": 2,
    "no-path-concat": 2,
    "no-plusplus": 0,
    "no-process-env": 0,
    "no-process-exit": 2,
    "no-proto": 2,
    "no-prototype-builtins": 2,
    "no-restricted-globals": 2,
    "no-restricted-imports": 2,
    "no-restricted-modules": 2,
    "no-restricted-syntax": 2,
    "no-return-assign": [2, "except-parens"],
    "no-script-url": 2,
    "no-sequences": 2,
    "no-shadow": 2,
    "no-spaced-func": 2,
    "no-sync": 2,
    "no-tabs": 2,
    "no-template-curly-in-string": 2,
    "no-ternary": 0,
    "no-this-before-super": 2,
    "no-throw-literal": 2,
    "no-undef-init": 2,
    "no-undefined": 0,
    "no-underscore-dangle": 0,
    "no-unmodified-loop-condition": 2,
    "no-unneeded-ternary": 2,
    "no-unused-expressions": 2,
    "no-unused-labels": 2,
    "no-use-before-define": 2,
    "no-useless-computed-key": 2,
    "no-useless-constructor": 2,
    "no-useless-escape": 2,
    "no-useless-rename": 2,
    "no-var": 2,
    "no-void": 2,
    "no-warning-comments": 0, // TODO: Change to `1`?
    "no-whitespace-before-property": 2,
    "object-curly-newline": [2, {"multiline": true}],
    "object-curly-spacing": [2, "never"],
    "object-property-newline": [2, {"allowMultiplePropertiesPerLine": true}],
    "one-var": [2, "never"],
    "one-var-declaration-per-line": [2, "initializations"],
    "operator-assignment": [2, "always"],
    "operator-linebreak": [2, "after"],
    "padded-blocks": [2, "never"],
    "prefer-arrow-callback": ["error", {"allowNamedFunctions": true}],
    "prefer-const": 0, // TODO: Change to `1`?
    "prefer-reflect": 0,
    "prefer-rest-params": 2,
    "prefer-spread": 2,
    "prefer-template": 2,
    "quote-props": [2, "consistent"],
    "radix": [2, "always"],
    "require-jsdoc": 0,
    "require-yield": 2,
    "semi": [2, "always"],
    "semi-spacing": [2, {"before": false, "after": true}],
    "sort-imports": 2,
    "sort-vars": 2,
    "space-in-parens": [2, "never"],
    "space-before-function-paren": [2, {"anonymous": "never", "named": "never", "asyncArrow": "always"}],
    "strict": 0,
    "template-curly-spacing": [2, "never"],
    "unicode-bom": [2, "never"],
    "valid-jsdoc": [0, {"requireReturn": false, "requireParamDescription": false, "requireReturnDescription": false}],
    "vars-on-top": 2,
    "wrap-iife": [2, "inside"],
    "wrap-regex": 0,
    "yield-star-spacing": [2, "after"],
    "yoda": [2, "never"]
  }
};
