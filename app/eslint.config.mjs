import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/{app,components,hooks}/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/services/mockData",
              message:
                "Import mock data through repository adapters instead of UI-level direct imports.",
            },
          ],
        },
      ],
    },
  },
  {
    // Temporary allowlist while legacy pages are migrated to repositories.
    files: [
      "src/app/**/rooms/page.tsx",
      "src/app/**/rooms/*/page.tsx",
      "src/app/**/billing/generate/page.tsx",
      "src/app/**/billing/meter-reading/page.tsx",
      "src/app/**/services/complaints/page.tsx",
      "src/app/**/reports/page.tsx",
    ],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
