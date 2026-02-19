# Reset Demo Script
# Restores broken test state for repeatable demos

param(
    [switch]$Backup = $false
)

$ErrorActionPreference = "Stop"

Write-Host "🔄 Resetting Demo Environment..." -ForegroundColor Cyan
Write-Host ""

# Paths
$projectRoot = $PSScriptRoot | Split-Path -Parent
$brokenFeature = Join-Path $projectRoot "features\wikipedia\Broken_Search.feature"
$brokenSteps = Join-Path $projectRoot "src\cucumber\step-definitions\wikipedia\broken-steps-demo.js"
$backupDir = Join-Path $projectRoot ".demo-backups"

# Create backup directory
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

if ($Backup) {
    # Backup current state (presumably fixed)
    Write-Host "💾 Backing up current (fixed) state..." -ForegroundColor Green
    
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $fixedBackupDir = Join-Path $backupDir "fixed-$timestamp"
    New-Item -ItemType Directory -Path $fixedBackupDir | Out-Null
    
    Copy-Item $brokenFeature -Destination (Join-Path $fixedBackupDir "Broken_Search.feature")
    Copy-Item $brokenSteps -Destination (Join-Path $fixedBackupDir "broken-steps-demo.js")
    
    Write-Host "   ✅ Saved to: $fixedBackupDir" -ForegroundColor Gray
    Write-Host ""
}

# Restore original broken versions
Write-Host "🔧 Restoring original broken versions..." -ForegroundColor Yellow

# Check if original broken versions exist in backup
$originalBrokenFeature = Join-Path $backupDir "original-Broken_Search.feature"
$originalBrokenSteps = Join-Path $backupDir "original-broken-steps-demo.js"

if ((Test-Path $originalBrokenFeature) -and (Test-Path $originalBrokenSteps)) {
    # Restore from backup
    Copy-Item $originalBrokenFeature -Destination $brokenFeature -Force
    Copy-Item $originalBrokenSteps -Destination $brokenSteps -Force
    
    Write-Host "   ✅ Restored from original backups" -ForegroundColor Green
} else {
    # Create original backups (first time)
    Write-Host "   📝 Creating original backups for future resets..." -ForegroundColor Gray
    Copy-Item $brokenFeature -Destination $originalBrokenFeature -Force
    Copy-Item $brokenSteps -Destination $originalBrokenSteps -Force
    Write-Host "   ✅ Original versions backed up" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Demo environment reset complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Run: .\run-tests.ps1 features/wikipedia/Broken_Search.feature"
Write-Host "   2. See failures in terminal and BrowserStack"
Write-Host "   3. Use MCP to debug and fix"
Write-Host "   4. Re-run to verify fixes"
Write-Host ""
Write-Host "💡 To backup fixed version: .\scripts\reset-demo.ps1 -Backup" -ForegroundColor Gray
