import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // New React Compiler rule surfaced by the eslint-config-next 16 upgrade.
    // Data-fetching effects were removed in P3; the remaining hits are form resets and
    // mount flags in components rebuilt in P4-P7. Switch back to "error" after P8.
    rules: { "react-hooks/set-state-in-effect": "warn" },
  },
  globalIgnores([".next/**", "node_modules/**", "dist/**", "build/**", "migrations/**", "next-env.d.ts"]),
]);
