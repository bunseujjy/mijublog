module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    parser: "babel-eslint",
    // ecmaVersion: 6,
    ecmaFeatures: {
      legacyDecorators: true,
    },
  },
  extends: ["@nuxtjs", "plugin:vue/base"],
  // add your custom rules here
  rules: {
    semi: [2, "always"],
    "comma-dangle": ["error", "only-multiline"],
    "no-multiple-empty-lines": ["error", { max: 2, maxEOF: 1 }],
    "space-before-function-paren": [
      "error",
      {
        anonymous: "always", //  (e.g. function () {})
        named: "never", // (e.g. function foo() {})
        asyncArrow: "always", // (e.g. async () => {})
      },
    ],
    "arrow-parens": ["error", "as-needed"],
  },
};
