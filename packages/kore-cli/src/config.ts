import { homedir } from "node:os";
import { join } from "node:path";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";

export interface KoreConfig {
  theme: string;
}

const DEFAULT_CONFIG: KoreConfig = {
  theme: "dark",
};

function getConfigPath(): string {
  return join(homedir(), ".kore", "config.json");
}

function getConfigDir(): string {
  return join(homedir(), ".kore");
}

export async function loadConfig(): Promise<KoreConfig> {
  const configPath = getConfigPath();

  if (!existsSync(configPath)) {
    return { ...DEFAULT_CONFIG };
  }

  try {
    const content = await readFile(configPath, "utf-8");
    const parsed = JSON.parse(content) as Partial<KoreConfig>;
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export async function saveConfig(config: KoreConfig): Promise<void> {
  const configDir = getConfigDir();
  const configPath = getConfigPath();

  try {
    if (!existsSync(configDir)) {
      await mkdir(configDir, { recursive: true });
    }
    await writeFile(configPath, JSON.stringify(config, null, 2), "utf-8");
  } catch (err) {
    process.stderr.write(
      `[kore] warning: failed to save config: ${err instanceof Error ? err.message : String(err)}\n`
    );
  }
}
