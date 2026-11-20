import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: globals.browser
    }
  },
  tseslint.configs.recommended,
  {
    rules: {
      "no-useless-escape": "off",
      "no-console": ["warn", {
        "allow": ["warn", "error"]
      }],
      "no-undef": "error",
      "brace-style": ["warn", "stroustrup"],
      "arrow-body-style": "off",
      "arrow-parens": [0, "as-needed"],
      "no-unused-expressions": ["error", {
        "allowShortCircuit": true,
        "allowTernary": true
      }],
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-unused-vars": "off"
    },
    languageOptions: {
      globals: {
        "window": "readonly",
        "document": "readonly",
        "console": "readonly",
        "app": "readonly",
        "Shopify": "readonly"
      }
    }
  },
  {
    files: ["**/*.{ts,mts,cts}"],
    rules: {
      "no-undef": "off" // TypeScript compiler handles this
    }
  },
  {
    // BaseComponent.destroy() always runs base cleanup; subclasses hook in via onDestroy()
    files: ["_scripts/components/**/*.ts"],
    ignores: ["_scripts/components/base.ts"],
    rules: {
      "no-restricted-syntax": ["error", {
        selector: "ClassDeclaration[superClass] > ClassBody > :matches(MethodDefinition, PropertyDefinition)[key.name='destroy']",
        message: "Don't override destroy(). Override onDestroy() instead (see CLAUDE.md)."
      }]
    }
  }
]);
