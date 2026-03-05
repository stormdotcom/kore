#!/bin/bash
# Install Kore System Monitor desktop launcher for Linux

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DESKTOP_FILE="$HOME/.local/share/applications/kore-monitor.desktop"

echo "Installing Kore System Monitor launcher..."

# Create applications directory if it doesn't exist
mkdir -p "$HOME/.local/share/applications"

# Detect terminal emulator
if command -v gnome-terminal &> /dev/null; then
    TERMINAL_CMD="gnome-terminal -- bash -c"
elif command -v alacritty &> /dev/null; then
    TERMINAL_CMD="alacritty -e bash -c"
elif command -v konsole &> /dev/null; then
    TERMINAL_CMD="konsole -e bash -c"
elif command -v xterm &> /dev/null; then
    TERMINAL_CMD="xterm -e bash -c"
else
    echo "Error: No supported terminal emulator found"
    echo "Please install one of: gnome-terminal, alacritty, konsole, xterm"
    exit 1
fi

# Create desktop file
cat > "$DESKTOP_FILE" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Kore System Monitor
Comment=Real-time cross-platform system monitor
Exec=$TERMINAL_CMD "cd '$PROJECT_DIR' && node packages/kore-cli/dist/index.js; exec bash"
Icon=utilities-system-monitor
Terminal=false
Categories=System;Monitor;
StartupNotify=true
EOF

# Make it executable
chmod +x "$DESKTOP_FILE"

# Update desktop database
if command -v update-desktop-database &> /dev/null; then
    update-desktop-database "$HOME/.local/share/applications"
fi

echo "✓ Desktop launcher installed successfully!"
echo "  Location: $DESKTOP_FILE"
echo "  You can now find 'Kore System Monitor' in your application menu"
echo ""
echo "To uninstall, run: rm '$DESKTOP_FILE'"
