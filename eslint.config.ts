import stylistic from '@stylistic/eslint-plugin';
import type { Linter } from 'eslint';
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  // Global ignores
  {
    ignores: [
      "dist/",
      "node_modules/",
      "*.config.js",
      "*.config.mjs",
      "*.config.ts",
      ".tmp/",
      "temp/"
    ]
  },
  ...tseslint.configs.strict as Linter.Config[],
  stylistic.configs.recommended as Linter.Config,
  {
    files: ["**/*.ts"],
    plugins: {
      "@stylistic": stylistic
    },
    rules: {
      // "@stylistic/multiline-ternary": "error",
      "@stylistic/brace-style": ["error", "1tbs", { "allowSingleLine": true }],
      "@stylistic/comma-dangle": ["error", "always-multiline"],
      "@stylistic/member-delimiter-style": [
        "error",
        {
          "multiline": {
            "delimiter": "semi",
            "requireLast": true
          },
          "singleline": {
            "delimiter": "semi",
            "requireLast": false
          },
          "multilineDetection": "brackets"
        }
      ],
      "@stylistic/no-multi-spaces": "off",
      "@stylistic/padded-blocks": "off",
      "@stylistic/semi": ["error", "always"],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-extraneous-class": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/unified-signatures": "off",
    }
  },
] as Linter.Config[]);
