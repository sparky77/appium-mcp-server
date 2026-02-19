# Session Context - AI Assistant "Personality Chip"

**Feed this into new Copilot sessions to restore full project context**

## Project Identity
- **Name**: Appium MCP Server - AI-Powered Mobile Testing Framework
- **Purpose**: Demonstrate the power of MCP-native mobile testing
- **Key Innovation**: Complete test suite generation through conversational AI

## Tech Stack
- **Runtime**: Node.js 22.17.1
- **Framework**: WebdriverIO 9.18.4 + @wdio/cucumber-framework 9.18.0
- **Cloud**: BrowserStack (Android 15.0, Samsung Galaxy Tab S10 Plus)
- **App Under Test**: Wikipedia Alpha (bs://363cb761bf2fea6658dc6a17b4e0dd7a47a10df1)
- **Credentials**: Set via BROWSERSTACK_USERNAME / BROWSERSTACK_ACCESS_KEY env vars
- **MCP SDK**: @modelcontextprotocol/sdk@1.17.0 (8 custom tools)

## MCP Tools Available
1. `mcp_appiummcp_inspect_screen` - Screen analysis with element discovery
2. `mcp_appiummcp_gesture` - Tap, swipe, scroll, long_press automation
3. `mcp_appiummcp_smart_action` - Natural language action execution
4. `mcp_appiummcp_handle_firebase_auth` - Firebase login flows
5. `mcp_appiummcp_generate_cucumber` - Auto-generate feature files
6. `mcp_appiummcp_analyze_gaps` - Coverage gap analysis
7. `mcp_appiummcp_finalize_page` - Page analysis completion
8. `mcp_appiummcp_smart_action` - Intelligent action routing

## Current Test Status (Last Run)
**Overall**: 35 passing, 10 failing, 11 skipped

### ✅ App Launch Feature (DEMO-READY)
- 19 steps passing
- Main "Main feed loads successfully" PASSED
- Dialog dismissal working
- BrowserStack session naming correct

### ⚠️ Search Feature (Selector Issues)
- 18 steps passing
- 4 failures: Using `~` instead of `id=` for Android resource IDs

### ❌ Article Navigation Feature (Needs Work)
- 3 scenarios failing
- Article page element discovery incomplete

## Key Project Files

### Test Framework
- `features/wikipedia/*.feature` - 3 feature files, 10 scenarios
- `src/cucumber/step-definitions/wikipedia/wikipedia-steps.js` - 294 lines, all steps
- `src/page-objects/wikipedia/` - WikipediaMainPage, SearchPage, ArticlePage
- `wdio.conf.js` - WDIO config with BrowserStack session naming

### MCP Discovery Documentation
- `mcp-nav/WikiDiscovery.md` - Complete MCP exploration replay (3 screens documented)
- `mcp-nav/app-map.md` - Element mappings
- `mcp-nav/test-registry.md` - Test scenario tracking

### Demo Materials
- `docs/DEMO-PLAYBOOK.md` - Complete demonstration guide
- `demo-start.ps1` - Quick launch script
- `.github/workflows/mobile-tests.yml` - CI/CD pipeline configuration

## Critical Rules & Patterns

### Android Selectors
- ❌ NEVER use `~org.wikipedia.alpha:id/element` (accessibility ID syntax)
- ✅ ALWAYS use `id=org.wikipedia.alpha:id/element` (resource ID syntax)

### Dialog Button IDs
- `android:id/button1` = OK button
- `android:id/button3` = Check for update button (NOT button2!)

### VS Code Cucumber Navigation
- Configured in `.vscode/settings.json`
- Ctrl+click works from feature files to step definitions

### BrowserStack Session Naming
- Implemented in `wdio.conf.js` beforeScenario hook
- Format: "Feature Name - Scenario Name"
- Quote escaping: `.replace(/"/g, '\\"')` in JSON payload

### Test Execution Commands
```powershell
# Credentials must be set in environment (or .env file loaded by dotenv)
# Single feature
npx wdio wdio.conf.js --spec features/wikipedia/app-launch.feature

# All features
npx wdio wdio.conf.js --spec features/wikipedia/*.feature

# Or use the convenience scripts
.\run-tests.ps1
.\run-tests-tags.ps1 "@search"
```

### Check Results
```powershell
# Latest test report
Get-ChildItem reports/*.xml | Sort-Object LastWriteTime -Descending | Select-Object -First 1 | Get-Content

# BrowserStack Dashboard
https://automate.browserstack.com/dashboard
```

## Known Issues & Solutions

### Issue: Cucumber Dependency Conflict
- **Problem**: @cucumber/cucumber v12.6.0 conflicted with @wdio/cucumber-framework
- **Solution**: Uninstalled @cucumber/cucumber, use only @wdio/cucumber-framework
- **Import**: `require('@wdio/cucumber-framework')` NOT `@cucumber/cucumber`

### Issue: Duplicate Step Files
- **Problem**: Step definitions in both root and nested folders
- **Solution**: Keep only `src/cucumber/step-definitions/wikipedia/wikipedia-steps.js`

### Issue: Element Not Found
- **Problem**: Using `~` selector syntax
- **Solution**: Change to `id=` syntax for Android resource IDs

### Issue: Tests Hang
- **Problem**: Auto-dismiss interfering with dialog test scenarios
- **Solution**: Removed auto-dismiss from launch step, manual dismiss in scenarios

## Active TODO (Check Before Starting Work)

**Before starting new session:**
1. Run: `Get-ChildItem reports/*.xml | Sort-Object LastWriteTime -Descending | Select-Object -First 1`
2. Check for new test failures
3. Review BrowserStack dashboard for session names
4. Confirm MCP server running: `http://localhost:3000` (if needed)

**Current Priorities:**
1. Fix search page selectors (`~` → `id=`)
2. Complete article page element discovery
3. Verify "Check for update" button scenario

## Communication Style
- Keep responses concise (1-3 sentences for simple queries)
- No emoji unless user requests
- Use markdown links for files: `[file.ts](file.ts#L10)`
- Execute commands directly, don't just suggest
- Always use absolute file paths in tool calls

## User Expectations
- **Showcase MCP power**: Demonstrate AI-driven test creation capabilities
- **Key Message**: "Rapid test development using MCP - the power of AI-native testing"
- **Working > Perfect**: Focus on solid passing scenarios and clear demonstrations

## Success Metrics
- ✅ Complete feature files with passing tests
- ✅ MCP discovery documented (WikiDiscovery.md)
- ✅ BrowserStack sessions properly configured
- ✅ Live MCP tool demonstrations
- ✅ Clean page object architecture
- 🎯 **Demo-Ready Status: 80% Complete**

---

**Last Updated**: 2026-02-17 23:45 UTC
**Next Session**: Continue fixing search/article selectors for full suite pass
