# Load environment variables and run tests
# Usage: .\run-tests.ps1 [feature-file]

param(
    [string]$spec = "features/wikipedia/*.feature"
)

# Set environment variables (or set these in your .env / system environment)
# $env:BROWSERSTACK_USERNAME = "YOUR_BROWSERSTACK_USERNAME"
# $env:BROWSERSTACK_ACCESS_KEY = "YOUR_BROWSERSTACK_ACCESS_KEY"
# $env:BS_APP_REFERENCE = "bs://YOUR_APP_HASH"

if (-not $env:BROWSERSTACK_USERNAME) {
    Write-Error "BROWSERSTACK_USERNAME is not set. Create a .env file or set the environment variable."
    exit 1
}

Write-Host "Running tests with Wikipedia Alpha app..." -ForegroundColor Cyan
Write-Host "Spec: $spec" -ForegroundColor Gray

# Run tests
npx wdio wdio.conf.js --spec $spec

Write-Host ""
Write-Host "Test execution complete!" -ForegroundColor Green
Write-Host "Check reports/ folder for JUnit XML results" -ForegroundColor Gray
