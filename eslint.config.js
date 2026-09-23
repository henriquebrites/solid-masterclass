import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";
import boundaries from "eslint-plugin-boundaries";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    ignores: ["dist", "node_modules"],
  },
  {
    languageOptions: {
      globals: globals.node,
    },
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: {
      js,
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
    extends: ["js/recommended"],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,mts,cts}"],
    plugins: { boundaries },
    settings: {
      "boundaries/elements": [
        { type: "application", pattern: "src/application/**" },
        { type: "drivers", pattern: "src/drivers/**" },
        { type: "resources", pattern: "src/resources/**" },
      ],
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "allow",
          policies: [
            {
              from: { element: { type: "application" } },
              disallow: [{ to: { element: { type: "drivers" } } }, { to: { element: { type: "resources" } } }],
              message:
                "application não pode importar de drivers ou resources — drivers e resources dependem de application, nunca o contrário.",
            },
          ],
        },
      ],
    },
  },
  eslintConfigPrettier,
]);
