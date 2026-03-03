import { defineConfig } from "bunup";

const bunupConfig = defineConfig({
  dts: true,
  entry: [
    "src/index.ts",
    "src/schemas/index.ts",
    "src/app-bridge/index.ts",
    "src/bridge-ui/index.ts",
    "src/assembly-client/index.ts",
  ],
  format: "esm",
  minify: true,
  sourcemap: true,
  splitting: true,
  target: "node",
});

export default bunupConfig;
