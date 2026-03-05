# Create Windows shortcut for Kore System Monitor

$ErrorActionPreference = "Stop"

$ProjectDir = Split-Path -Parent $PSScriptRoot
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $DesktopPath "Kore System Monitor.lnk"

Write-Host "Creating Kore System Monitor shortcut..." -ForegroundColor Cyan

# Detect Windows Terminal
$WtPath = Get-Command wt.exe -ErrorAction SilentlyContinue
$NodePath = Get-Command node.exe -ErrorAction SilentlyContinue

if (-not $NodePath) {
    Write-Host "Error: Node.js not found in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Create shortcut
$WScriptShell = New-Object -ComObject WScript.Shell
$Shortcut = $WScriptShell.CreateShortcut($ShortcutPath)
$Shortcut.WorkingDirectory = $ProjectDir

if ($WtPath) {
    # Use Windows Terminal if available
    $Shortcut.TargetPath = "wt.exe"
    $Shortcut.Arguments = "-w -1 --title `"Kore System Monitor`" node packages/kore-cli/dist/index.js"
    Write-Host "  Using Windows Terminal" -ForegroundColor Green
} else {
    # Fallback to cmd
    $Shortcut.TargetPath = "cmd.exe"
    $Shortcut.Arguments = "/k `"cd /d `"$ProjectDir`" && node packages\kore-cli\dist\index.js`""
    Write-Host "  Using cmd.exe (Windows Terminal not found)" -ForegroundColor Yellow
}

$Shortcut.Description = "Real-time cross-platform system monitor"
$Shortcut.IconLocation = "C:\Windows\System32\perfmon.exe,0"
$Shortcut.Save()

Write-Host "✓ Shortcut created successfully!" -ForegroundColor Green
Write-Host "  Location: $ShortcutPath" -ForegroundColor White
Write-Host ""
Write-Host "Double-click the shortcut on your desktop to launch Kore System Monitor" -ForegroundColor Cyan
