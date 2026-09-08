import kuzzle from "eslint-plugin-kuzzle";

// Flat config, as required by eslint 9. The `.eslintrc.json` this replaces was
// Kuzzle's own, copied verbatim; the rule sets below are the same three, in the
// same order, now spread instead of extended.
export default [
  {
    ignores: [
      "lib/**",
      "src/templates/**",
      "coverage/**",
      ".nyc_output/**",
      "package/**",
    ],
  },
  ...kuzzle.configs.default,
  ...kuzzle.configs.node,
  ...kuzzle.configs.typescript,
];
