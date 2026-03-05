#!/usr/bin/env node
import { MetricsCollector } from "kore-core";
import type { SystemSnapshot } from "kore-core";
import { Dashboard } from "./dashboard.js";
import { loadConfig, saveConfig } from "./config.js";
import { getTheme, getThemeNames } from "./themes.js";

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

async function main(): Promise<void> {
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
