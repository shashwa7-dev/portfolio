import { defineConfig, globalIgnores } from "eslint/config";
import next from "eslint-config-next";

/**
 * ESLint 9 flat config. Next 16 removed `next lint`, so `npm run lint` is
 * `eslint .` and this file replaces `.eslintrc.json`, with the same two rules
 * turned off.
 */
export default defineConfig([
  globalIgnores([".next/**", ".cache/**", ".superpowers/**", ".agents/**", "public/**", "next-env.d.ts"]),
  {
    extends: [...next],
    rules: {
      "react/no-unescaped-entities": "off",
      "@next/next/no-page-custom-font": "off",
      // New in eslint-plugin-react-hooks 6 (React Compiler rules), arriving
      // with eslint-config-next 16. They flag patterns already in the codebase
      // (state set in effects, refs read in render) that work today. Warnings
      // until they are fixed component by component, rather than rewriting
      // fifteen components inside a framework upgrade.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/immutability": "warn",
    },
  },
]);
