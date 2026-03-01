import { defineConfig } from "bunup";

const bunupConfig = defineConfig({
  dts: true,
  entry: [
    "src/index.ts",
    "src/app-bridge/index.ts",
    "src/schemas/index.ts",
    "src/schemas/base/index.ts",
    "src/schemas/responses/index.ts",
    "src/schemas/requests/index.ts",
    "src/errors/index.ts",
    "src/bridge-ui/index.ts",
  ],
  format: "esm",
  minify: true,
  sourcemap: true,
  splitting: true,
  target: "node",
});

export default bunupConfig;
