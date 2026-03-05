import blessed from "blessed";
import contrib from "blessed-contrib";
import type { SystemSnapshot, ThemeDefinition } from "kore-core";
import {
  formatBytesPerSec,
  formatGb,
  formatPercent,
  formatUptime,
} from "kore-core";
import { getTheme, getNextTheme } from "./themes.js";

interface DashboardWidgets {
  cpuLine: contrib.Widgets.LineElement;
  memDonut: contrib.Widgets.DonutElement;
  netSpark: contrib.Widgets.SparklineElement;
  diskTable: contrib.Widgets.TableElement;
  processTable: contrib.Widgets.TableElement;
  systemInfo: blessed.Widgets.BoxElement;
}

export class Dashboard {
  private screen: blessed.Widgets.Screen;
  private grid: contrib.grid;
  private widgets: DashboardWidgets;
  private cpuHistory: number[][] = [];
  private rxHistory: number[] = [];
  private txHistory: number[] = [];
  private maxSparkHistory = 30;
  private currentTheme: ThemeDefinition;
  private onThemeChange: (theme: ThemeDefinition) => Promise<void>;

  constructor(
    initialTheme: ThemeDefinition,
    onThemeChange: (theme: ThemeDefinition) => Promise<void>
  ) {
    this.currentTheme = initialTheme;
    this.onThemeChange = onThemeChange;
    this.screen = blessed.screen({
      smartCSR: true,
      title: "kore — system monitor",
      fullUnicode: true,
    });

    this.grid = new contrib.grid({
      rows: 12,
      cols: 12,
      screen: this.screen,
    });

    this.widgets = this.buildWidgets();
    this.bindKeys();
    this.applyTheme();
  }

  private buildWidgets(): DashboardWidgets {
    const t = this.currentTheme.colors;

    const cpuLine = this.grid.set(0, 0, 4, 8, contrib.line, {
      label: " CPU Usage (%) ",
      showLegend: true,
      legend: { width: 12 },
      style: {
        line: t.sparkline,
        text: t.textPrimary,
        baseline: t.textPrimary,
      },
      xLabelPadding: 3,
      xPadding: 5,
      wholeNumbersOnly: true,
      minY: 0,
      maxY: 100,
    }) as contrib.Widgets.LineElement;

    const memDonut = this.grid.set(0, 8, 4, 4, contrib.donut, {
      label: " Memory ",
      radius: 10,
      arcWidth: 3,
      remainColor: t.barEmpty,
      yPadding: 2,
    }) as contrib.Widgets.DonutElement;

    const netSpark = this.grid.set(4, 0, 3, 6, contrib.sparkline, {
      label: " Network I/O ",
      tags: true,
      style: {
        fg: t.sparkline,
        titleFg: t.textPrimary,
      },
    }) as contrib.Widgets.SparklineElement;

    const systemInfo = this.grid.set(4, 6, 3, 6, blessed.box, {
      label: " System Info ",
      tags: true,
      padding: { left: 1, top: 1 },
      style: {
        fg: t.textPrimary,
        border: { fg: t.label },
      },
      border: { type: "line" },
    }) as blessed.Widgets.BoxElement;

    const diskTable = this.grid.set(7, 0, 2, 6, contrib.table, {
      label: " Disks ",
      columnSpacing: 2,
      columnWidth: [16, 12, 10, 10, 8],
      fg: t.textPrimary,
      keys: false,
      interactive: false,
    }) as contrib.Widgets.TableElement;

    const processTable = this.grid.set(7, 6, 5, 6, contrib.table, {
      label: " Top Processes ",
      columnSpacing: 2,
      columnWidth: [8, 20, 8, 8],
      fg: t.textPrimary,
      keys: false,
      interactive: false,
    }) as contrib.Widgets.TableElement;

    return { cpuLine, memDonut, netSpark, diskTable, processTable, systemInfo };
  }

  private bindKeys(): void {
    this.screen.key(["q", "C-c", "escape"], () => {
      this.destroy();
      process.exit(0);
    });

    this.screen.key(["t"], async () => {
      const nextThemeName = getNextTheme(this.currentTheme.name);
      this.currentTheme = getTheme(nextThemeName);
      this.applyTheme();
      await this.onThemeChange(this.currentTheme);
      this.screen.render();
    });
  }

  update(snapshot: SystemSnapshot): void {
    this.updateCpu(snapshot);
    this.updateMemory(snapshot);
    this.updateNetwork(snapshot);
    this.updateDisks(snapshot);
    this.updateProcesses(snapshot);
    this.updateSystemInfo(snapshot);
    this.screen.render();
  }

  private updateCpu(snapshot: SystemSnapshot): void {
    if (this.cpuHistory.length === 0) {
      this.cpuHistory = [[]];
    }
    const overall = this.cpuHistory[0];
    if (overall) {
      overall.push(Math.round(snapshot.cpu.overallLoad));
      if (overall.length > this.maxSparkHistory) {
        overall.shift();
      }
    }

    const xLabels = Array.from({ length: overall?.length ?? 0 }, (_, i) =>
      String(i)
    );

    const t = this.currentTheme.colors;
    const seriesData: contrib.Widgets.LineData[] = [
      {
        title: "Total",
        x: xLabels,
        y: overall ?? [],
        style: { line: t.sparkline },
      },
    ];

    this.widgets.cpuLine.setData(seriesData);
  }

  private updateMemory(snapshot: SystemSnapshot): void {
    const t = this.currentTheme.colors;
    const ramPercent = snapshot.memory.usagePercent;
    const swapPercent = snapshot.memory.swapUsagePercent;

    const getRamColor = (percent: number): string => {
      if (percent > 90) return t.barAlert;
      if (percent > 70) return t.barWarn;
      return t.barFilled;
    };

    const getSwapColor = (percent: number): string => {
      if (percent > 80) return t.barAlert;
      if (percent > 50) return t.barWarn;
      return t.barFilled;
    };

    const data = [
      {
        label: `RAM ${formatGb(snapshot.memory.usedGb)}/${formatGb(snapshot.memory.totalGb)}`,
        percent: Math.round(ramPercent),
        color: getRamColor(ramPercent),
      },
    ];

    if (snapshot.memory.swapTotalGb > 0) {
      data.push({
        label: `Swap ${formatGb(snapshot.memory.swapUsedGb)}/${formatGb(snapshot.memory.swapTotalGb)}`,
        percent: Math.round(swapPercent),
        color: getSwapColor(swapPercent),
      });
    }

    this.widgets.memDonut.setData(data);
  }

  private updateNetwork(snapshot: SystemSnapshot): void {
    let totalRx = 0;
    let totalTx = 0;
    for (const iface of snapshot.network) {
      totalRx += iface.rxSec;
      totalTx += iface.txSec;
    }

    this.rxHistory.push(totalRx);
    this.txHistory.push(totalTx);
    if (this.rxHistory.length > this.maxSparkHistory) this.rxHistory.shift();
    if (this.txHistory.length > this.maxSparkHistory) this.txHistory.shift();

    this.widgets.netSpark.setData(
      [`RX ${formatBytesPerSec(totalRx)}`, `TX ${formatBytesPerSec(totalTx)}`],
      [this.rxHistory, this.txHistory]
    );
  }

  private updateDisks(snapshot: SystemSnapshot): void {
    const headers = ["Mount", "Size", "Used", "Avail", "Use%"];
    const rows = snapshot.disks.map((d) => [
      d.mount.length > 14 ? `..${d.mount.slice(-12)}` : d.mount,
      formatGb(d.sizeGb),
      formatGb(d.usedGb),
      formatGb(d.availableGb),
      formatPercent(d.usagePercent),
    ]);

    this.widgets.diskTable.setData({
      headers,
      data: rows.length > 0 ? rows : [["—", "—", "—", "—", "—"]],
    });
  }

  private updateProcesses(snapshot: SystemSnapshot): void {
    const headers = ["PID", "Name", "CPU%", "MEM%"];
    const rows = snapshot.topProcesses.map((p) => [
      String(p.pid),
      p.name.length > 18 ? p.name.slice(0, 18) : p.name,
      formatPercent(p.cpu),
      formatPercent(p.memory),
    ]);

    this.widgets.processTable.setData({
      headers,
      data: rows.length > 0 ? rows : [["—", "—", "—", "—"]],
    });
  }

  private updateSystemInfo(snapshot: SystemSnapshot): void {
    const s = snapshot.system;
    const tempStr =
      snapshot.cpu.temperature !== null
        ? `${snapshot.cpu.temperature.toFixed(0)}°C`
        : "N/A";

    const lines = [
      `{bold}Host:{/bold}     ${s.hostname}`,
      `{bold}OS:{/bold}       ${s.distro} ${s.release}`,
      `{bold}Kernel:{/bold}   ${s.kernel}`,
      `{bold}Arch:{/bold}     ${s.arch}`,
      `{bold}Uptime:{/bold}   ${formatUptime(s.uptime)}`,
      `{bold}CPU Freq:{/bold} ${snapshot.cpu.frequency} GHz`,
      `{bold}CPU Temp:{/bold} ${tempStr}`,
      `{bold}Cores:{/bold}    ${snapshot.cpu.coreLoads.length}`,
    ];

    this.widgets.systemInfo.setContent(lines.join("\n"));
  }

  private applyTheme(): void {
    const t = this.currentTheme.colors;

    // CPU Line
    if (this.widgets.cpuLine.style) {
      this.widgets.cpuLine.style.line = t.sparkline;
      this.widgets.cpuLine.style.text = t.textPrimary;
      this.widgets.cpuLine.style.baseline = t.textPrimary;
    }

    // Memory Donut
    if (this.widgets.memDonut.options) {
      this.widgets.memDonut.options.remainColor = t.barEmpty;
    }

    // Network Sparkline
    if (this.widgets.netSpark.style) {
      this.widgets.netSpark.style.fg = t.sparkline;
      this.widgets.netSpark.style.titleFg = t.textPrimary;
    }

    // System Info Box
    if (this.widgets.systemInfo.style) {
      this.widgets.systemInfo.style.fg = t.textPrimary;
      if (this.widgets.systemInfo.style.border) {
        this.widgets.systemInfo.style.border.fg = t.label;
      }
    }

    // Disk Table
    if (this.widgets.diskTable.options) {
      this.widgets.diskTable.options.fg = t.textPrimary;
    }

    // Process Table
    if (this.widgets.processTable.options) {
      this.widgets.processTable.options.fg = t.textPrimary;
    }
  }

  destroy(): void {
    try {
      this.screen.destroy();
    } catch {
      // blessed can throw when program is undefined (e.g. failed init or packaged exe)
    }
  }
}
