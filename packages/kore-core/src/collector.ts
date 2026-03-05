import si from "systeminformation";
import { EventEmitter } from "node:events";
import type {
  CollectorConfig,
  CpuMetrics,
  DiskMetrics,
  MemoryMetrics,
  NetworkMetrics,
  ProcessInfo,
  SystemInfo,
  SystemSnapshot,
} from "./types.js";

const DEFAULT_CONFIG: CollectorConfig = {
  intervalMs: 1000,
  maxHistoryLength: 60,
  topProcessCount: 10,
};

export class MetricsCollector extends EventEmitter {
  private config: CollectorConfig;
  private timer: ReturnType<typeof setInterval> | null = null;
  private history: SystemSnapshot[] = [];
  private systemInfoCache: SystemInfo | null = null;

  constructor(config?: Partial<CollectorConfig>) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async start(): Promise<void> {
    await this.cacheSystemInfo();
    await this.tick();
    this.timer = setInterval(() => {
      this.tick().catch((err: unknown) => {
        this.emit("error", err);
      });
    }, this.config.intervalMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  getHistory(): readonly SystemSnapshot[] {
    return this.history;
  }

  getLatest(): SystemSnapshot | null {
    return this.history[this.history.length - 1] ?? null;
  }

  private async cacheSystemInfo(): Promise<void> {
    const [osInfo, timeData] = await Promise.all([
      si.osInfo(),
      si.time(),
    ]);
    this.systemInfoCache = {
      hostname: osInfo.hostname,
      platform: osInfo.platform,
      distro: osInfo.distro,
      release: osInfo.release,
      arch: osInfo.arch,
      kernel: osInfo.kernel,
      uptime: typeof timeData.uptime === "string"
        ? parseInt(timeData.uptime, 10)
        : timeData.uptime,
    };
  }

  private async tick(): Promise<void> {
    const snapshot = await this.collectSnapshot();
    this.history.push(snapshot);
    if (this.history.length > this.config.maxHistoryLength) {
      this.history.shift();
    }
    this.emit("snapshot", snapshot);
  }

  private async collectSnapshot(): Promise<SystemSnapshot> {
    const [cpu, mem, net, disks, procs, timeData] = await Promise.all([
      this.collectCpu(),
      this.collectMemory(),
      this.collectNetwork(),
      this.collectDisks(),
      this.collectProcesses(),
      si.time(),
    ]);

    const system: SystemInfo = this.systemInfoCache
      ? {
          ...this.systemInfoCache,
          uptime: typeof timeData.uptime === "string"
            ? parseInt(timeData.uptime, 10)
            : timeData.uptime,
        }
      : {
          hostname: "",
          platform: "",
          distro: "",
          release: "",
          arch: "",
          kernel: "",
          uptime: typeof timeData.uptime === "string"
            ? parseInt(timeData.uptime, 10)
            : timeData.uptime,
        };

    return {
      timestamp: Date.now(),
      cpu,
      memory: mem,
      network: net,
      disks,
      topProcesses: procs,
      system,
    };
  }

  private async collectCpu(): Promise<CpuMetrics> {
    const [load, cpuData, temp] = await Promise.all([
      si.currentLoad(),
      si.cpu(),
      si.cpuTemperature().catch(() => null),
    ]);

    return {
      overallLoad: load.currentLoad,
      coreLoads: load.cpus.map((c) => c.load),
      frequency: cpuData.speed,
      temperature: temp?.main ?? null,
    };
  }

  private async collectMemory(): Promise<MemoryMetrics> {
    const mem = await si.mem();
    const toGb = (bytes: number): number =>
      Math.round((bytes / 1073741824) * 100) / 100;

    return {
      usedGb: toGb(mem.used),
      freeGb: toGb(mem.free),
      totalGb: toGb(mem.total),
      swapUsedGb: toGb(mem.swapused),
      swapFreeGb: toGb(mem.swapfree),
      swapTotalGb: toGb(mem.swaptotal),
      usagePercent: (mem.used / mem.total) * 100,
      swapUsagePercent:
        mem.swaptotal > 0 ? (mem.swapused / mem.swaptotal) * 100 : 0,
    };
  }

  private async collectNetwork(): Promise<NetworkMetrics[]> {
    const stats = await si.networkStats();
    return stats
      .filter((s) => s.iface !== "lo" && s.operstate === "up")
      .map((s) => ({
        interface: s.iface,
        rxSec: s.rx_sec ?? 0,
        txSec: s.tx_sec ?? 0,
        rxTotal: s.rx_bytes,
        txTotal: s.tx_bytes,
      }));
  }

  private async collectDisks(): Promise<DiskMetrics[]> {
    const fsSize = await si.fsSize();
    const toGb = (bytes: number): number =>
      Math.round((bytes / 1073741824) * 100) / 100;

    return fsSize.map((fs) => ({
      filesystem: fs.fs,
      mount: fs.mount,
      type: fs.type,
      sizeGb: toGb(fs.size),
      usedGb: toGb(fs.used),
      availableGb: toGb(fs.available),
      usagePercent: fs.use,
    }));
  }

  private async collectProcesses(): Promise<ProcessInfo[]> {
    const procs = await si.processes();
    return procs.list
      .sort((a, b) => b.cpu - a.cpu)
      .slice(0, this.config.topProcessCount)
      .map((p) => ({
        pid: p.pid,
        name: p.name,
        cpu: p.cpu,
        memory: p.mem,
        command: p.command,
      }));
  }
}
