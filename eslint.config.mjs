import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // New React Compiler rule surfaced by the eslint-config-next 16 upgrade.
    // The flagged components (raw useEffect data/prop syncing) are rewritten in
    // P3 (data fetching) and P4-P7 (redesigns); switch back to "error" after that.
    rules: { "react-hooks/set-state-in-effect": "warn" },
  },
  globalIgnores([".next/**", "node_modules/**", "dist/**", "build/**", "migrations/**", "next-env.d.ts"]),
]);
