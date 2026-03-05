#!/bin/bash
# Launch Kore System Monitor in a new terminal window

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLI_PATH="$SCRIPT_DIR/packages/kore-cli/dist/index.js"

# Check if built
if [ ! -f "$CLI_PATH" ]; then
    echo "Error: CLI not built. Running build first..."
    cd "$SCRIPT_DIR"
    pnpm build
fi

# Detect and use available terminal emulator
if command -v gnome-terminal &> /dev/null; then
    echo "Launching Kore System Monitor in GNOME Terminal..."
    gnome-terminal --title="Kore System Monitor" -- bash -c "cd '$SCRIPT_DIR' && node '$CLI_PATH'; exec bash"
elif command -v alacritty &> /dev/null; then
    echo "Launching Kore System Monitor in Alacritty..."
    alacritty --title "Kore System Monitor" -e bash -c "cd '$SCRIPT_DIR' && node '$CLI_PATH'; exec bash"
elif command -v konsole &> /dev/null; then
    echo "Launching Kore System Monitor in Konsole..."
    konsole --title "Kore System Monitor" -e bash -c "cd '$SCRIPT_DIR' && node '$CLI_PATH'; exec bash"
elif command -v xterm &> /dev/null; then
    echo "Launching Kore System Monitor in XTerm..."
    xterm -title "Kore System Monitor" -e bash -c "cd '$SCRIPT_DIR' && node '$CLI_PATH'; exec bash"
else
    echo "Error: No supported terminal emulator found"
    echo "Please install one of: gnome-terminal, alacritty, konsole, xterm"
    exit 1
fi

echo "✓ Kore System Monitor launched in new window"
