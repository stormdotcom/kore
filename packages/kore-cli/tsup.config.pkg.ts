import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"], // CommonJS for pkg
  dts: false,
  clean: false,
  sourcemap: false,
  target: "node18",
  outDir: "../../dist-pkg",
  outExtension: () => ({ js: ".cjs" }),
  noExternal: ["kore-core"], // Bundle workspace packages
  external: [
    // Node.js built-ins - always external
    /^node:.*/,
    // Optional blessed dependencies
    "term.js",
    "pty.js",
    // Problematic packages with dynamic requires - let pkg handle them
    "blessed",
    "blessed-contrib",
    "systeminformation",
  ],
  esbuildOptions(options) {
    options.platform = "node";
    options.mainFields = ["module", "main"];
    options.external = [
      ...((options.external as string[]) || []),
      "term.js",
      "pty.js",
    ];
  },
});
