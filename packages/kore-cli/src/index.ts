import { execSync } from "node:child_process";
import { MetricsCollector } from "kore-core";
import type { SystemSnapshot } from "kore-core";
import { Dashboard } from "./dashboard.js";
import { loadConfig, saveConfig } from "./config.js";
import { getTheme, getThemeNames } from "./themes.js";

const MIN_COLS = 80;
const MIN_ROWS = 24;

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
  let cols = process.stdout.columns;
  let rows = process.stdout.rows;

  if (cols == null || rows == null) {
    process.stderr.write(
      `[kore] Cannot detect terminal size. Run in an interactive terminal (PowerShell, Windows Terminal, etc.).\n`
    );
    process.exit(1);
  }

  const isValid =
    cols % 2 === 0 &&
    rows % 4 === 0 &&
    cols >= MIN_COLS &&
    rows >= MIN_ROWS;

  if (!isValid && process.platform === "win32") {
    try {
      execSync(`cmd /c mode con: cols=${MIN_COLS} lines=${MIN_ROWS}`, {
        stdio: "ignore",
        timeout: 1000,
      });
      cols = process.stdout.columns ?? cols;
      rows = process.stdout.rows ?? rows;
    } catch {
      // mode may fail in Windows Terminal; fall through to error
    }
  }

  if (cols % 2 !== 0 || rows % 4 !== 0) {
    process.stderr.write(
      `[kore] Terminal size must be: width multiple of 2, height multiple of 4.\n` +
        `  Current: ${cols}×${rows}. Resize to e.g. 80×24 or 82×24.\n`
    );
    process.exit(1);
  }
  if (cols < MIN_COLS || rows < MIN_ROWS) {
    process.stderr.write(
      `[kore] Terminal too small. Minimum ${MIN_COLS}×${MIN_ROWS}, current ${cols}×${rows}.\n`
    );
    process.exit(1);
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
