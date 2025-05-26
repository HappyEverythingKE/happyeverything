import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from 'eslint-config-prettier'
import drizzlePlugin from 'eslint-plugin-drizzle'


export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    plugins: {
      drizzle: drizzlePlugin
    },
    rules: {
      ...drizzlePlugin.configs.recommended.rules,
    },
  }
]);
