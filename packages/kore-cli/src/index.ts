import { execSync } from "node:child_process";
import { createRequire } from "node:module";

// Patch drawille Canvas to accept any terminal size (round width to even, height to multiple of 4)
const require = createRequire(import.meta.url);
const drawilleModule = require("drawille-blessed-contrib");
const OriginalCanvas = typeof drawilleModule === "function" ? drawilleModule : drawilleModule.Canvas;
if (OriginalCanvas) {
  const PatchedCanvas = function (width: number, height: number) {
    const w = Math.max(2, Math.floor(Number(width) / 2) * 2);
    const h = Math.max(4, Math.floor(Number(height) / 4) * 4);
    return new OriginalCanvas(w, h);
  };
  const mod = require.cache[require.resolve("drawille-blessed-contrib")];
  if (mod) mod.exports = PatchedCanvas;
}

import { MetricsCollector } from "kore-core";
import type { SystemSnapshot } from "kore-core";
import { Dashboard } from "./dashboard.js";
import { loadConfig, saveConfig } from "./config.js";
import { getTheme, getThemeNames } from "./themes.js";

const MIN_COLS = 66;
const MIN_ROWS = 16;

interface CliArgs {
  theme: string | null;
  intervalMs: number;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    theme: null,
    intervalMs: 1000,
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg) continue;

    if (arg === "--theme" || arg === "-t") {
      const themeArg = argv[i + 1];
      args.theme = themeArg ?? null;
      i++;
    } else if (arg === "--help" || arg === "-h") {
      console.log(`
kore - system monitor

Usage:
  kore [options] [interval_ms]

Options:
  --theme, -t <name>   Set theme (${getThemeNames().join(", ")})
  --help, -h           Show this help

Controls:
  q, Ctrl+C, Esc       Quit
  t                    Cycle themes

Examples:
  kore                 Start with default theme
  kore --theme nord    Start with Nord theme
  kore 2000            Update every 2 seconds
      `);
      process.exit(0);
    } else {
      const num = parseInt(arg, 10);
      if (!isNaN(num)) {
        args.intervalMs = num;
      }
    }
  }

  return args;
}

function checkTerminalSize(): void {
  const cols = process.stdout.columns;
  const rows = process.stdout.rows;

  if (cols == null || rows == null) {
    process.stderr.write(
      `[kore] Cannot detect terminal size. Run in an interactive terminal (PowerShell, Windows Terminal, etc.).\n`
    );
    process.exit(1);
  }

  if (cols < MIN_COLS || rows < MIN_ROWS) {
    process.stderr.write(
      `[kore] Terminal too small. Minimum ${MIN_COLS}×${MIN_ROWS}, current ${cols}×${rows}.\n`
    );
    process.exit(1);
  }

  // Try to resize on Windows if terminal is small
  if (cols < 80 || rows < 24) {
    if (process.platform === "win32") {
      try {
        execSync(`cmd /c mode con: cols=${MIN_COLS} lines=${MIN_ROWS}`, {
          stdio: "ignore",
          timeout: 1000,
        });
      } catch {
        // mode may fail in Windows Terminal
      }
    }
  }
}

async function main(): Promise<void> {
  checkTerminalSize();

  const cliArgs = parseArgs(process.argv);
  const config = await loadConfig();

  // CLI arg overrides saved config
  const initialTheme = cliArgs.theme ?? config.theme;
  const theme = getTheme(initialTheme);

  const collector = new MetricsCollector({
    intervalMs: cliArgs.intervalMs,
    maxHistoryLength: 120,
    topProcessCount: 15,
  });

  const dashboard = new Dashboard(theme, async (newTheme) => {
    await saveConfig({ theme: newTheme.name });
  });

  collector.on("snapshot", (snapshot: SystemSnapshot) => {
    dashboard.update(snapshot);
  });

  collector.on("error", (err: unknown) => {
    process.stderr.write(
      `[kore] metrics error: ${err instanceof Error ? err.message : String(err)}\n`
    );
  });

  const cleanup = (): void => {
    collector.stop();
    dashboard.destroy();
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  await collector.start();
}

main().catch((err: unknown) => {
  process.stderr.write(
    `[kore] fatal: ${err instanceof Error ? err.message : String(err)}\n`
  );
  process.exit(1);
});
