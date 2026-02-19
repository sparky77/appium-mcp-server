# PowerShell script to add appium-mcp-server to Claude Desktop config

$configPath = "$env:APPDATA\Claude\claude_desktop_config.json"

# The config to add
$newServerConfig = @{
    "appiumMCP" = @{
        command = "node"
        args = @("d:\Apps\appium-mcp-server\src\server.js")
        env = @{
            BROWSERSTACK_USERNAME = $env:BROWSERSTACK_USERNAME
            BROWSERSTACK_ACCESS_KEY = $env:BROWSERSTACK_ACCESS_KEY
            BS_APP_REFERENCE = $env:BS_APP_REFERENCE
        }
    }
}

if (-not $env:BROWSERSTACK_USERNAME -or -not $env:BROWSERSTACK_ACCESS_KEY -or -not $env:BS_APP_REFERENCE) {
    Write-Host "ERROR: Set BROWSERSTACK_USERNAME, BROWSERSTACK_ACCESS_KEY, and BS_APP_REFERENCE env vars first." -ForegroundColor Red
    exit 1
}

# Ensure the directory exists
$configDir = Split-Path $configPath -Parent
if (-not (Test-Path $configDir)) {
    Write-Host "Creating Claude config directory..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
}

# Check if config file exists
if (Test-Path $configPath) {
    Write-Host "Reading existing Claude Desktop config..." -ForegroundColor Cyan
    $config = Get-Content $configPath -Raw | ConvertFrom-Json

    if (-not $config.mcpServers) {
        $config | Add-Member -NotePropertyName "mcpServers" -NotePropertyValue @{} -Force
    }

    $config.mcpServers | Add-Member -NotePropertyName "appiumMCP" -NotePropertyValue $newServerConfig["appiumMCP"] -Force

    Copy-Item $configPath "$configPath.backup" -Force
    Write-Host "Backed up existing config to $configPath.backup" -ForegroundColor Green

} else {
    Write-Host "Creating new Claude Desktop config..." -ForegroundColor Cyan
    $config = @{
        mcpServers = $newServerConfig
    }
}

$config | ConvertTo-Json -Depth 10 | Set-Content $configPath -Encoding UTF8

Write-Host ""
Write-Host "Configuration added successfully!" -ForegroundColor Green
Write-Host "Added server: appiumMCP" -ForegroundColor Yellow
Write-Host "Config location: $configPath" -ForegroundColor Gray
Write-Host ""
Write-Host "IMPORTANT: Restart Claude Desktop for changes to take effect!" -ForegroundColor Yellow
