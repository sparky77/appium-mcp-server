#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Run WebdriverIO tests by Cucumber tags
.DESCRIPTION
    Execute tests filtered by Cucumber tag expressions
.PARAMETER Tags
    Tag expression to filter tests (e.g., '@smoke', '@critical and not @broken', '@search or @navigation')
.EXAMPLE
    .\run-tests-tags.ps1 "@smoke"
    .\run-tests-tags.ps1 "@critical and not @broken"
    .\run-tests-tags.ps1 "@broken-demo"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$Tags
)

# Set BrowserStack credentials (or set these in your .env / system environment)
# $env:BROWSERSTACK_USERNAME = "YOUR_BROWSERSTACK_USERNAME"
# $env:BROWSERSTACK_ACCESS_KEY = "YOUR_BROWSERSTACK_ACCESS_KEY"
# $env:BS_APP_REFERENCE = "bs://YOUR_APP_HASH"

if (-not $env:BROWSERSTACK_USERNAME) {
    Write-Error "BROWSERSTACK_USERNAME is not set. Create a .env file or set the environment variable."
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Running tests with tags: $Tags" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Run WebdriverIO with tag expression
npx wdio wdio.conf.js --cucumberOpts.tags="$Tags"

$exitCode = $LASTEXITCODE
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($exitCode -eq 0) {
    Write-Host "Test execution completed successfully!" -ForegroundColor Green
} else {
    Write-Host "Test execution failed with exit code: $exitCode" -ForegroundColor Red
}
Write-Host "========================================" -ForegroundColor Cyan

exit $exitCode
