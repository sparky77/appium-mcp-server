# Quick Reference - Appium MCP Server

## 🚀 Start New AI Session
```
1. Copy entire contents of SESSION-CONTEXT.md
2. Paste into new GitHub Copilot chat
3. AI will have full project context ("personality chip" loaded)
```

## 📁 Project Structure
```
├── SESSION-CONTEXT.md          ← AI personality chip (START HERE)
├── mcp-nav/                    ← AI's app discovery notebook
│   ├── WikiDiscovery.md        ← MCP exploration replay
│   ├── app-map.md              ← Element reference
│   └── test-registry.md        ← Coverage tracking
├── features/wikipedia/         ← Cucumber test scenarios
├── src/
│   ├── page-objects/wikipedia/ ← Page object models
│   └── cucumber/step-definitions/wikipedia/
├── docs/                       ← Design docs, playbooks
└── wdio.conf.js               ← Test runner config
```

## ⚡ Essential Commands

### Run Tests
```powershell
# Set credentials in .env file first (copy .env.example to .env)
# Then run:

# Single feature
npx wdio wdio.conf.js --spec features/wikipedia/app-launch.feature

# All features
npx wdio wdio.conf.js --spec features/wikipedia/*.feature

# By tag
.\run-tests-tags.ps1 "@search"
.\run-tests-tags.ps1 "@broken"
```

### Check Results
```powershell
# Latest test report
Get-ChildItem reports/*.xml | Sort-Object LastWriteTime -Descending | Select-Object -First 1 | Get-Content

# Quick summary
Get-ChildItem reports/*.xml | Sort-Object LastWriteTime -Descending | Select-Object -First 1 | Get-Content | Select-String -Pattern "tests="
```

### BrowserStack
```
Dashboard: https://automate.browserstack.com/dashboard
Device: Samsung Galaxy Tab S10 Plus, Android 15.0
```

## 🎯 Current Status (Last Run: 2026-02-17 23:45)
- ✅ **App Launch**: 19/21 steps passing (DEMO-READY)
- ⚠️ **Search**: 18/29 steps passing (selector issues)
- ❌ **Article Nav**: 0/14 steps passing (needs element discovery)

**Overall: 35 passing, 10 failing, 11 skipped**

## 🔧 Common Fixes

### Selector Issues
❌ `~org.wikipedia.alpha:id/element` (wrong)
✅ `id=org.wikipedia.alpha:id/element` (correct)

### Dialog Buttons
- `android:id/button1` = OK
- `android:id/button3` = Check for update

### Step Definitions
Import: `require('@wdio/cucumber-framework')`
NOT: `require('@cucumber/cucumber')`

## 📚 Key Documentation
- **Demo Script**: docs/DEMO-PLAYBOOK.md
- **MCP Discovery**: mcp-nav/WikiDiscovery.md
- **Architecture**: docs/FOLDER-STRUCTURE.md
- **Test Coverage**: docs/TEST-COVERAGE-SUMMARY.md

## 💡 Key Demonstration Points
1. "Rapid test development using MCP"
2. Show WikiDiscovery.md (MCP exploration)
3. Live demo: inspect_screen tool
4. Show passing tests on BrowserStack
5. "This is AI-native testing"

---

**For detailed context**: See SESSION-CONTEXT.md
**For MCP tools**: See mcp-nav/WikiDiscovery.md
