# kore

> A real-time terminal system monitor for Linux and Windows.

Displays CPU, memory, network, and disk metrics in a modern TUI dashboard with live sparklines, a sticky always-visible header, and multiple themes. Built with TypeScript and Node.js.

```
┌─────────────────────────────────────────────────────────────────────┐
│ KORE v1.0.0   hostname: DESKTOP   up: 3h 21m                       │
│ CPU 47% ████████░░░░░░░░  │  MEM 6.2 / 16 GB ████████████░░░░      │
├───────────────────┬─────────────────────────────────────────────────┤
│  CPU CORES        │  MEMORY                                         │
│  Core 0  72% ███  │  RAM   ████████████░░░░  6.2 / 16.0 GB         │
│  Core 1  45% ██░  │  Swap  ████░░░░░░░░░░░░  0.5 /  4.0 GB         │
│  Core 2  21% █░░  ├─────────────────────────────────────────────────┤
│  Core 3  88% ███  │  NETWORK                                        │
│  Core 4  55% ██░  │  eth0   ↑  1.2 MB/s    ↓  4.5 MB/s             │
│  Core 5  10% ░░░  ├─────────────────────────────────────────────────┤
│                   │  DISK                                           │
│                   │  sda    R  45 MB/s      W  12 MB/s              │
├───────────────────┴─────────────────────────────────────────────────┤
│  HISTORY — last 60s                                                 │
│  CPU  ▁▂▄▆█▇▅▃▁▂▃▄▅▆▄▃▂▁▁▂▄▆▇▅▃▁▂▃▄▅▄▃▂▁                           │
│  MEM  ▅▅▅▅▅▅▅▅▅▅▆▆▆▆▆▆▆▆▆▆▇▇▇▇▆▆▆▅▅▅▅▅▅▅▅▆▆▆▆▆▇▇▇▇▇▆▆▆▅▅▅▅▅▅        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Features

- **Sticky header** — CPU % and memory usage always visible at the top, no matter what
- **Per-core CPU bars** — see every core at a glance, color-coded by load
- **Memory & swap** — used / total in GB with live progress bars
- **Network I/O** — upload and download speed per interface
- **Disk I/O** — read/write MB/s per device
- **60s sparkline history** — rolling graph for CPU and memory
- **Multiple themes** — dark, nord, matrix — switch on the fly
- **Cross-platform** — Linux (bash, zsh, fish) and Windows (PowerShell 5.1, PS7, Windows Terminal)
- **JSON stream mode** — pipe metrics to other tools with `--json`

---

## Install

```bash
npm install -g kore-cli
```

Or with pnpm:

```bash
pnpm add -g kore-cli
```

---

## Usage

```bash
kore                        # launch full TUI dashboard
kore --theme nord           # start with nord theme
kore --theme matrix         # start with matrix theme
kore --interval 500         # poll every 500ms (default: 1000)
kore --no-color             # monochrome ASCII fallback
kore --json                 # stream newline-delimited JSON, no TUI
kore --json | jq '.cpu.total'
kore --version
kore --help
```

---

## Themes

| Theme    | Description                              |
|----------|------------------------------------------|
| `dark`   | Default. Near-black bg, green accents    |
| `nord`   | Arctic palette, soft blues and greens    |
| `matrix` | Black bg, full green — classic hacker    |

Switch theme at runtime by pressing **`t`** — cycles through all themes.  
The active theme is saved to `~/.kore/config.json` automatically.

---

## Keyboard Shortcuts

| Key         | Action                              |
|-------------|-------------------------------------|
| `q` / `Ctrl+C` | Quit, restore terminal           |
| `t`         | Cycle to next theme                 |
| `h`         | Toggle help overlay                 |
| `r`         | Reset history buffers               |
| `+` / `-`   | Increase / decrease poll interval   |
| `Tab`       | Cycle focused pane                  |
| `f`         | Freeze / unfreeze display           |

---

## Windows Setup

kore works in PowerShell 5.1, PowerShell 7+, and Windows Terminal.

For best results (full color and Unicode bars), run via the included wrapper:

```powershell
# From the repo root
.\scripts\kore.ps1
```

If you see a script execution error:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

**Windows Terminal** is recommended — it supports full 24-bit color and Unicode block characters out of the box.

---

## Linux Setup

Works in bash, zsh, and fish inside GNOME Terminal, Alacritty, Kitty, tmux, and screen.

```bash
# Install globally
npm i -g kore-cli

# Run
kore
```

**Inside tmux or screen**, kore auto-detects the environment and sets the correct `TERM` fallback. If colors look wrong, set manually:

```bash
export TERM=xterm-256color
kore
```

**Temperature sensors** — if your system or VM doesn't expose CPU temps, kore shows `—` gracefully without crashing.

---

## JSON Stream Mode

Pipe raw metrics to any tool:

```bash
kore --json                          # one MetricsSnapshot per line
kore --json --interval 200           # fast stream (200ms)
kore --json | jq '.cpu.total'        # just CPU %
kore --json | jq '.memory.used'      # used memory in GB
```

---

## Monorepo Structure

```
kore/
├── packages/
│   ├── kore-core/     # Metrics collection, types, EventEmitter
│   └── kore-cli/      # TUI rendering, themes, CLI flags
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.json
```

`kore-core` is a pure data layer with no CLI dependencies — you can import it into your own tools or a web dashboard.

---

## Requirements

- Node.js 18 or 20 LTS
- Terminal size: 80×24 minimum

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for how to add new metric panels and themes.

---

## License

MIT
