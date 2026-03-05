# kore

Cross-platform real-time system monitor CLI tool.

```
┌─ CPU Usage (%) ──────────────────────┐┌─ Memory ──────┐
│ ▂▃▅▇█▇▅▃▂▁▂▃▅▇█▇▅▃▂                ││  RAM  72%     │
│                                      ││  Swap 12%     │
└──────────────────────────────────────┘└───────────────┘
┌─ Network I/O ────────┐┌─ System Info ─────────┐
│ RX ▁▂▃▅▇▅▃▂▁ 1.2MB/s ││ Host:   mypc          │
│ TX ▁▁▂▃▂▁▁▁▁ 340KB/s ││ OS:     Windows 11    │
└──────────────────────┘└───────────────────────┘
```

## Quick Start

```bash
pnpm install
pnpm build
pnpm start
```

## Usage

```bash
# Default 1s polling interval
pnpm start

# Custom interval (ms)
node packages/kore-cli/dist/index.js 2000
```

Press `q`, `Esc`, or `Ctrl+C` to exit.

## Project Structure

```
packages/
├── kore-core/   # Metrics collection (systeminformation), types, formatters
└── kore-cli/    # Terminal UI (blessed + blessed-contrib)
```

## Metrics

- **CPU** — overall %, per-core %, frequency, temperature
- **Memory** — used/free/total RAM & swap (GB + %)
- **Network** — RX/TX bytes per second with sparkline history
- **Disk** — mount, size, used, available, usage %
- **Processes** — top 15 by CPU usage (PID, name, CPU%, MEM%)
- **System** — hostname, OS, kernel, arch, uptime

## Requirements

- Node.js 18+
- pnpm

## Platforms

- Windows (PowerShell 5.1, PS7, Windows Terminal)
- Linux (bash, zsh, fish — GNOME Terminal, Alacritty, tmux)
