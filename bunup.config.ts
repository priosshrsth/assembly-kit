import { defineConfig } from "bunup";

const bunupConfig = defineConfig({
  dts: true,
  entry: [
    "src/index.ts",
    "src/schemas/index.ts",
    "src/assembly-kit/index.ts",
    "src/bridge-ui/index.ts",
    "src/logger/index.ts",
    "src/errors/index.ts",
  ],
  format: "esm",
  minify: true,
  sourcemap: true,
  splitting: true,
  target: "node",
});

export default bunupConfig;
