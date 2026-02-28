import { defineConfig } from "bunup";

const bunupConfig = defineConfig({
  dts: true,
  entry: ["src/index.ts"],
  format: "esm",
  minify: true,
  sourcemap: true,
  splitting: true,
  target: "node",
});

export default bunupConfig;
