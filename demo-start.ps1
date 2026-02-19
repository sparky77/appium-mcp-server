#!/usr/bin/env pwsh
# Quick demo startup script

Write-Host "🚀 STARTING MCP MOBILE TESTING DEMO..." -ForegroundColor Cyan
Write-Host ""

# Check Node version
Write-Host "📋 Checking Node.js..." -ForegroundColor Yellow
node --version

# Check if MCP server is ready
Write-Host ""
Write-Host "📦 Checking dependencies..." -ForegroundColor Yellow
if (!(Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Red
    npm install
}

Write-Host ""
Write-Host "✅ READY TO DEMO!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Terminal 1: npm start (MCP server)"
Write-Host "2. Open Claude Desktop"
Write-Host "3. Terminal 2: npm run test:cucumber (run tests)"
Write-Host ""
Write-Host "📖 See DEMO-PLAYBOOK.md for full demo flow"
Write-Host ""
Write-Host "💪 YOU GOT THIS! LET'S FLEX!" -ForegroundColor Magenta
