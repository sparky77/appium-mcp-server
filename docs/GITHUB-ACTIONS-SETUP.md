# GitHub Actions Setup Guide

## Overview
This guide explains how to set up secure CI/CD for BrowserStack mobile testing in a **public repository**.

## Security Model

### ✅ GitHub Secrets are SAFE for Public Repos
- **Encrypted at rest** using industry-standard encryption
- **Never exposed** in logs, even in failed builds
- **Access controlled** - only workflow runs can access them
- **Not visible** in pull requests from forks (security measure)
- **Redacted automatically** if accidentally printed

### 🔒 What Gets Protected
- BrowserStack username
- BrowserStack access key
- App reference URLs
- Any other sensitive configuration

## Setup Steps

### 1. Add Secrets to GitHub Repository

#### Navigate to Settings:
1. Go to your GitHub repository
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**
4. Click **New repository secret**

#### Add These Secrets:

**Secret 1: BROWSERSTACK_USERNAME**
- Name: `BROWSERSTACK_USERNAME`
- Value: *(your BrowserStack username)*
- Click **Add secret**

**Secret 2: BROWSERSTACK_ACCESS_KEY**
- Name: `BROWSERSTACK_ACCESS_KEY`
- Value: *(your BrowserStack access key)*
- Click **Add secret**

**Secret 3: BS_APP_REFERENCE**
- Name: `BS_APP_REFERENCE`
- Value: `bs://363cb761bf2fea6658dc6a17b4e0dd7a47a10df1`
- Click **Add secret**

### 2. Verify Workflow File Exists

The workflow file is already created at:
```
.github/workflows/browserstack-tests.yml
```

### 3. Commit and Push

```bash
git add .github/workflows/browserstack-tests.yml
git commit -m "Add GitHub Actions CI/CD for BrowserStack tests"
git push origin main
```

### 4. Verify Setup

1. Go to **Actions** tab in GitHub
2. You should see "BrowserStack Mobile Tests" workflow
3. It will run automatically on push to main/develop branches

## Workflow Triggers

### Automatic Triggers:
- **Push to main branch** - Runs smoke + critical tests
- **Push to develop branch** - Runs smoke + critical tests
- **Pull requests to main** - Runs smoke tests only

### Manual Trigger:
1. Go to **Actions** tab
2. Select "BrowserStack Mobile Tests"
3. Click **Run workflow**
4. Enter custom tags (e.g., `@search`, `@broken-demo`)
5. Click **Run workflow** button

## Workflow Structure

### Job 1: Smoke Tests (Runs First)
- Tags: `@smoke`
- Purpose: Quick validation
- Duration: ~3-5 minutes
- Blocks critical tests if failed

### Job 2: Critical Tests (Runs After Smoke)
- Tags: `@critical and not @broken`
- Purpose: Full regression
- Duration: ~10-15 minutes
- Generates BrowserStack dashboard

### Job 3: Manual Tag Tests (On-Demand)
- Tags: Custom (user input)
- Purpose: Flexible testing
- Use cases: Testing fixes, demos, debugging

## Artifacts Generated

After each run, downloadable artifacts include:
- **test-results-smoke/** - JUnit XML and logs
- **test-results-critical/** - JUnit XML and logs
- **allure-report-smoke/** - HTML test report
- **browserstack-dashboard/** - Interactive dashboard
- Retention: 30 days

## Accessing Test Results

### Option 1: GitHub Actions UI
1. Click on workflow run
2. Scroll to **Artifacts** section
3. Download zip file
4. Extract and open `allure-report/index.html`

### Option 2: BrowserStack Dashboard
1. Visit https://automate.browserstack.com/dashboard
2. Filter by build name: "Wikipedia Test Suite - [DATE]"
3. Click on sessions to see video/logs

### Option 3: Download Dashboard
1. Click on workflow run
2. Download `browserstack-dashboard` artifact
3. Open `dashboard.html` in browser

## Security Best Practices

### ✅ DO:
- Use GitHub Secrets for ALL credentials
- Rotate secrets periodically (quarterly)
- Use separate BrowserStack accounts for CI/CD
- Review workflow logs for sensitive data leaks
- Enable branch protection on main branch

### ❌ DON'T:
- **NEVER** hardcode credentials in workflow files
- **NEVER** echo/print secret values
- **NEVER** commit secrets to git history
- **NEVER** use production credentials in CI
- **NEVER** allow workflow edits from forks without approval

## Fork Security

GitHub automatically protects secrets from forks:
- **Forks cannot access secrets** from parent repo
- **Pull requests from forks** require manual approval to run workflows
- **This prevents** malicious PRs from stealing credentials

To test from forks:
1. Fork owner must add their own secrets
2. Or parent repo maintainer approves workflow run

## Troubleshooting

### Workflow Not Running?
- Check **Actions** tab is enabled (Settings → Actions → General)
- Verify workflow file is in `.github/workflows/` directory
- Check YAML syntax is valid

### Tests Failing?
- Download artifacts to see detailed logs
- Check BrowserStack dashboard for session videos
- Verify app reference URL is still valid
- Check BrowserStack account has sufficient parallel sessions

### Secrets Not Working?
- Verify secret names match exactly (case-sensitive)
- Re-add secrets if recently rotated
- Check workflow uses correct secret names: `${{ secrets.SECRET_NAME }}`

## Cost Optimization

### BrowserStack Parallel Sessions
Current config uses `maxInstances: 3` - **adjust based on your plan:**
- **Free tier**: 1 parallel session → set `maxInstances: 1`
- **Paid tier**: 5+ parallel sessions → keep `maxInstances: 3` or increase

### GitHub Actions Minutes
- **Public repos**: Unlimited free minutes ✅
- **Private repos**: Limited free minutes (2000/month)

## Advanced Configuration

### Run Tests on Schedule
Add to workflow triggers:
```yaml
on:
  schedule:
    - cron: '0 2 * * *'  # Run daily at 2 AM UTC
```

### Notify on Failure
Add Slack/Teams notification step:
```yaml
- name: Notify failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Matrix Testing (Multiple Devices)
```yaml
strategy:
  matrix:
    device: ['Samsung Galaxy S23', 'Google Pixel 8']
    os: ['13.0', '14.0']
```

## Related Files
- `.github/workflows/browserstack-tests.yml` - Main workflow definition
- `wdio.conf.js` - WebdriverIO configuration (used by GitHub Actions)
- `package.json` - npm scripts (test:cucumber, browserstack:dashboard)
- `docs/TAG-REFERENCE.md` - Tag documentation for filtering tests

## Next Steps
1. ✅ Add secrets to GitHub repo
2. ✅ Commit workflow file
3. ✅ Push to main branch
4. ✅ Verify workflow runs successfully
5. ✅ Download artifacts and review results
6. 🔄 Iterate and optimize based on results
