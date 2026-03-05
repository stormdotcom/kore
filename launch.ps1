#!/usr/bin/env pwsh
# Launch Kore System Monitor in a new terminal window

$ErrorActionPreference = "Stop"

$ProjectDir = $PSScriptRoot
$CliPath = Join-Path $ProjectDir "packages\kore-cli\dist\index.js"

# Check if built
if (-not (Test-Path $CliPath)) {
    Write-Host "Error: CLI not built. Running build first..." -ForegroundColor Yellow
    Push-Location $ProjectDir
    pnpm build
    Pop-Location
}

# Detect Windows Terminal
$WtPath = Get-Command wt.exe -ErrorAction SilentlyContinue

if ($WtPath) {
    # Use Windows Terminal
    Write-Host "Launching Kore System Monitor in Windows Terminal..." -ForegroundColor Cyan
    Start-Process wt.exe -ArgumentList "-w -1 --title `"Kore System Monitor`" node `"$CliPath`""
} else {
    # Fallback to PowerShell
    Write-Host "Launching Kore System Monitor in PowerShell..." -ForegroundColor Cyan
    Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", "cd '$ProjectDir'; node '$CliPath'"
}

Write-Host "✓ Kore System Monitor launched in new window" -ForegroundColor Green
