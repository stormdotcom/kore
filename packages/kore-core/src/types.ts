export interface CpuMetrics {
  overallLoad: number;
  coreLoads: number[];
  frequency: number;
  temperature: number | null;
}

export interface MemoryMetrics {
  usedGb: number;
  freeGb: number;
  totalGb: number;
  swapUsedGb: number;
  swapFreeGb: number;
  swapTotalGb: number;
  usagePercent: number;
  swapUsagePercent: number;
}

export interface NetworkMetrics {
  interface: string;
  rxSec: number;
  txSec: number;
  rxTotal: number;
  txTotal: number;
}

export interface DiskMetrics {
  filesystem: string;
  mount: string;
  type: string;
  sizeGb: number;
  usedGb: number;
  availableGb: number;
  usagePercent: number;
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
  command: string;
}

export interface SystemInfo {
  hostname: string;
  platform: string;
  distro: string;
  release: string;
  arch: string;
  uptime: number;
  kernel: string;
}

export interface SystemSnapshot {
  timestamp: number;
  cpu: CpuMetrics;
  memory: MemoryMetrics;
  network: NetworkMetrics[];
  disks: DiskMetrics[];
  topProcesses: ProcessInfo[];
  system: SystemInfo;
}

export interface CollectorConfig {
  intervalMs: number;
  maxHistoryLength: number;
  topProcessCount: number;
}
