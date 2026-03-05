#!/usr/bin/env node
import { build } from "esbuild";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

const packageJson = JSON.parse(
  readFileSync(join(rootDir, "packages", "kore-cli", "package.json"), "utf-8")
);

console.log("📦 Bundling kore for packaging...");

try {
  await build({
    entryPoints: [join(rootDir, "packages", "kore-cli", "dist", "index.js")],
    bundle: true,
    platform: "node",
    target: "node18",
    format: "cjs", // pkg requires CommonJS
    outfile: join(rootDir, "dist-pkg", "kore.cjs"),
    external: [
      // Node.js built-ins
      "child_process",
      "fs",
      "os",
      "path",
      // Optional blessed dependencies (not used by kore)
      "term.js",
      "pty.js",
    ],
    // No banner - pkg will add shebang for executables
    minify: false,
    sourcemap: false,
    logLevel: "info",
  });

  console.log("✅ Bundle created successfully at dist-pkg/kore.cjs");
  console.log(`   Version: ${packageJson.version}`);
} catch (error) {
  console.error("❌ Bundle failed:", error);
  process.exit(1);
}
