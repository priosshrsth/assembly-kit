import path from "node:path";

import { defineConfig } from "vite-plus";

export default defineConfig({
  resolve: {
    alias: {
      src: path.resolve(import.meta.dirname, "src"),
    },
  },
  staged: {
    "*": "vp check --fix",
  },
  pack: {
    entry: [
      "src/index.ts",
      "src/bridge-ui/index.ts",
      "src/client/index.ts",
      "src/errors/index.ts",
      "src/logger/index.ts",
      "src/schemas/index.ts",
      "src/token/index.ts",
    ],
    exports: {
      customExports(exports) {
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(exports)) {
          if (typeof value === "string" && value.endsWith(".mjs")) {
            result[key] = {
              types: value.replace(/\.mjs$/, ".d.mts"),
              import: value,
            };
          } else {
            result[key] = value;
          }
        }
        return result;
      },
    },
    sourcemap: true,
    dts: {
      tsgo: true,
    },
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
    rules: {
      "oxc/no-barrel-file": "off",
      "unicorn/filename-case": ["error", { case: "kebabCase" }],
      "typescript/consistent-type-imports": "error",
    },
  },
  fmt: {
    oxfmtrc: {
      printWidth: 80,
      tabWidth: 2,
      useTabs: false,
      semi: true,
      singleQuote: false,
      quoteProps: "as-needed",
      jsxSingleQuote: false,
      trailingComma: "es5",
      bracketSpacing: true,
      bracketSameLine: false,
      arrowParens: "always",
      endOfLine: "lf",
      experimentalSortPackageJson: true,
      experimentalSortImports: {
        ignoreCase: true,
        newlinesBetween: true,
        order: "asc",
      },
    },
  },
});
