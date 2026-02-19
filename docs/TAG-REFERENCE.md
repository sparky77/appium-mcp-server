# Cucumber Tag Reference

## Overview
This document lists all available Cucumber tags for test filtering and execution strategies.

## Available Tags

### Test Level Tags
- `@smoke` - Quick smoke tests for basic functionality verification
- `@critical` - Critical path tests that must pass
- `@poc` - Proof of concept/demo tests
- `@demo` - Demonstration tests

### Feature Tags
- `@wikipedia` - Wikipedia app tests
- `@search` - Search functionality tests
- `@navigation` - Navigation and article browsing tests
- `@language` - Language settings tests
- `@dialog-test` - Dialog interaction tests

### Broken Test Tags (for MCP debugging demo)
- `@broken-demo` - All intentionally broken tests
- `@broken-selector` - Tests with incorrect element selectors
- `@broken-wait` - Tests with missing or incorrect waits
- `@broken-element` - Tests with element interaction issues
- `@broken-state` - Tests with state management issues

## Usage Examples

### Run with npm scripts:
```bash
# Smoke tests only
npm run test:smoke

# Critical tests only
npm run test:critical

# All broken tests
npm run test:broken

# Specific broken test type
npm run test:broken:selector
npm run test:broken:wait
npm run test:broken:element
npm run test:broken:state

# Search feature tests (by spec)
npm run test:search
```

### Run with PowerShell script:
```powershell
# Single tag
.\run-tests-tags.ps1 "@smoke"

# Tag expressions with AND
.\run-tests-tags.ps1 "@critical and not @broken"

# Tag expressions with OR
.\run-tests-tags.ps1 "@search or @navigation"

# Complex expressions
.\run-tests-tags.ps1 "(@smoke or @critical) and not @broken"
```

### Run with npx directly:
```bash
# Single tag
npx wdio wdio.conf.js --cucumberOpts.tagExpression='@smoke'

# Multiple tags (AND)
npx wdio wdio.conf.js --cucumberOpts.tagExpression='@critical and @wikipedia'

# Multiple tags (OR)
npx wdio wdio.conf.js --cucumberOpts.tagExpression='@search or @navigation'

# Negation
npx wdio wdio.conf.js --cucumberOpts.tagExpression='not @broken'
```

## Tag Expression Syntax

Cucumber supports boolean expressions:
- `@tag` - Has tag
- `not @tag` - Does not have tag
- `@tag1 and @tag2` - Has both tags
- `@tag1 or @tag2` - Has either tag
- `(@tag1 or @tag2) and @tag3` - Grouping with parentheses

## Current Test Distribution

### search.feature
- Feature: `@smoke @wikipedia @search`
- Scenarios:
  - "Successful search returns results" - `@critical`
  - "Search field accepts text input" - `@critical`
  - "Search with no results" - (no additional tags)
  - "Clear search field" - (no additional tags)

### Broken_Search.feature
- Feature: `@smoke @wikipedia @search @broken-demo`
- Scenarios:
  - "Successful search returns results (BROKEN)" - `@critical @broken-selector`
  - "Search field accepts text input (BROKEN)" - `@critical @broken-wait`
  - "Search with no results (BROKEN)" - `@broken-element`
  - "Clear search field (BROKEN)" - `@broken-state`

### article-navigation.feature
- Feature: `@smoke @wikipedia`
- Scenarios:
  - "Navigate to article from feed" - `@critical`
  - "Article has readable content" - (no additional tags)
  - "Navigate back from article" - (no additional tags)

### app-launch.feature
- Feature: `@smoke @wikipedia`
- Scenarios:
  - "Launch app and verify main screen" - `@critical @dialog-test`
  - "Launch app and dismiss dialog using BOTTOM" - `@critical @dialog-test`

### language-settings.feature
- Feature: (no feature-level tags)
- Scenarios:
  - "Change app language" - `@broken @demo`
  - "Add preferred language" - `@broken @demo`

## Best Practices

1. **Tag Consistently**: Use standard tags across features
2. **Tag Hierarchies**: Feature-level tags apply to all scenarios
3. **Smoke Tests**: Should be fast (<2min total)
4. **Critical Tests**: Must cover core user journeys
5. **Broken Tags**: Only for intentional demo/debugging scenarios

## Parallel Execution with Tags

Tags are evaluated BEFORE parallelization:
```powershell
# This runs @smoke tests in parallel (if multiple features match)
.\run-tests-tags.ps1 "@smoke"

# This runs @critical tests from search features only
npx wdio wdio.conf.js --spec='features/wikipedia/*earch.feature' --cucumberOpts.tagExpression='@critical'
```

## Adding New Tags

When adding new tags:
1. Document in this file
2. Add corresponding npm script if commonly used
3. Use existing tag categories where possible
4. Follow naming convention: lowercase, hyphenated

## Related Files
- [package.json](../package.json) - npm scripts for common tag combinations
- [run-tests-tags.ps1](../run-tests-tags.ps1) - PowerShell script for tag execution
- [run-tests.ps1](../run-tests.ps1) - PowerShell script for spec execution
- [wdio.conf.js](../wdio.conf.js) - WebdriverIO configuration with Cucumber options
