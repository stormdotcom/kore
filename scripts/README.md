# Launcher Scripts

Scripts to create desktop shortcuts and application launchers for Kore System Monitor.

## Windows

Create a desktop shortcut:

```powershell
# Run from project root
.\scripts\create-windows-shortcut.ps1
```

This will create a shortcut on your desktop that opens Kore in Windows Terminal (if available) or cmd.

**Requirements:**
- Node.js must be in PATH
- Optionally: Windows Terminal for better experience

## Linux

Install as a desktop application:

```bash
# Run from project root
chmod +x scripts/install-linux-launcher.sh
./scripts/install-linux-launcher.sh
```

This will:
- Create a `.desktop` file in `~/.local/share/applications/`
- Make Kore available in your application menu/launcher
- Auto-detect your terminal emulator (gnome-terminal, alacritty, konsole, xterm)

**Requirements:**
- One of: gnome-terminal, alacritty, konsole, or xterm
- Node.js must be installed

### Uninstall (Linux)

```bash
rm ~/.local/share/applications/kore-monitor.desktop
```

## Notes

- Make sure to run `pnpm build` before using the launchers
- The shortcuts launch the built application from `packages/kore-cli/dist/index.js`
- Working directory is set to the project root automatically
