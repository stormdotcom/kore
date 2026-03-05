import { MetricsCollector } from "kore-core";
import type { SystemSnapshot } from "kore-core";
import { Dashboard } from "./dashboard.js";

const INTERVAL_MS = parseInt(process.argv[2] ?? "1000", 10);

async function main(): Promise<void> {
  const collector = new MetricsCollector({
    intervalMs: INTERVAL_MS,
    maxHistoryLength: 120,
    topProcessCount: 15,
  });

  const dashboard = new Dashboard();

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
