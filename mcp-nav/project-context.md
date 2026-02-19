# Project Context - Appium MCP Server

**Last Updated:** February 18, 2026
**Version:** 0.3.0 (Wikipedia POC)
**Status:** ✅ Sprint 3 Active — Wikipedia test suite running, CI/CD live

---

## 🎯 What Is This Project?

A **custom Model Context Protocol (MCP) server** that makes mobile app testing conversational and AI-powered. Instead of writing Appium test code, you talk to GitHub Copilot or Claude in natural language, and it intelligently tests your mobile app on BrowserStack.

### The Innovation

```
Traditional:  Write code → Find elements → Handle waits → Track coverage manually
This Project: "Test the search feature" → AI does everything → Generates test scenarios
```

---

## 📦 Technology Stack

### Core Dependencies
- **Node.js:** v22.17.1 (runtime)
- **MCP SDK:** @modelcontextprotocol/sdk@1.17.0
- **WebdriverIO:** 9.18.4 (Appium client)
- **Cucumber:** @wdio/cucumber-framework@9.18.0 (BDD)
- **Transport:** stdio (VS Code/Claude Desktop)

### Reporters
- **Allure:** @wdio/allure-reporter + allure-commandline
- **JUnit:** @wdio/junit-reporter (CI/CD integration)
- **Spec:** @wdio/spec-reporter (console output)

### Testing Infrastructure
- **BrowserStack:** Cloud device provider
- **Device:** Samsung Galaxy Tab S10 Plus (Android 15.0)
- **App:** Wikipedia Alpha mobile app
- **App ID:** `bs://363cb761bf2fea6658dc6a17b4e0dd7a47a10df1`
- **Automation:** UiAutomator2

### IDE Integration
- **VS Code:** 1.108.2 with MCP support
- **GitHub Copilot:** 1.102+ (AI assistant)
- **Claude Code:** Primary AI assistant (VS Code extension)
- **Config:** `.vscode/mcp.json`

---

## 📁 Project Structure

```
appium-mcp-server/
├── src/
│   ├── server.js                        # MCP server (7 tools)
│   ├── appium/
│   │   └── session.js                   # BrowserStack connection manager
│   ├── analysis/
│   │   └── screen.js                    # Screen analyzer (AI context)
│   ├── coverage/
│   │   └── analyzer.js                  # Coverage tracker (in-memory)
│   ├── cucumber/
│   │   ├── generator.js                 # Auto-generates feature files
│   │   └── step-definitions/
│   │       └── wikipedia/
│   │           ├── wikipedia-steps.js   # Main step definitions
│   │           ├── hooks.js             # Before/After hooks (shared)
│   │           └── broken-steps-demo.js # Intentionally broken (demo)
│   ├── gestures/
│   │   └── engine.js                    # Smart element finding (7 strategies)
│   └── page-objects/
│       └── wikipedia/
│           ├── WikipediaMainPage.js     # Main feed
│           ├── WikipediaSearchPage.js   # Search view
│           └── WikipediaArticlePage.js  # Article display
├── features/
│   └── wikipedia/
│       ├── app-launch.feature           # App startup scenarios
│       ├── search.feature               # @smoke @wikipedia @search (4 scenarios)
│       ├── article-navigation.feature   # Article browsing
│       └── Broken_Search.feature       # @search @broken — demo broken steps (3 scenarios)
├── scripts/
│   ├── fetch-test-results.js            # BrowserStack results fetcher
│   ├── generate-dashboard.js            # Dashboard generator
│   └── inspect-wikipedia.js            # Screen inspection utility
├── docs/                                # All documentation (archived here)
│   ├── DEV-JOURNAL.md
│   ├── SPRINT-1-COMPLETE.md
│   ├── SPRINT-2-READY.md
│   └── ... (other docs)
├── mcp-nav/                             # AI handover + navigation documentation
│   ├── handover-prompt.md              # Personality chip for new AI sessions
│   ├── project-context.md              # (you are here) Technical reference
│   ├── WikiDiscovery.md                # MCP-driven discovery log
│   ├── app-map.md                      # Screen/element map
│   └── test-registry.md                # Feature coverage matrix
├── .github/
│   └── workflows/ci.yml                # GitHub Actions CI/CD
├── wdio.conf.js                         # Cucumber test runner config
├── .vscode/
│   └── mcp.json                        # VS Code MCP integration (CRITICAL)
├── reports/                             # JUnit XML + Allure output
├── allure-results/                      # Raw Allure data
└── allure-report/                       # Generated HTML report
```

---

## 🚀 How to Start

### VS Code Integration (Primary)

**Config File:** `.vscode/mcp.json`

```json
{
  "servers": {
    "appiumMCP": {
      "type": "stdio",
      "command": "node",
      "args": ["${workspaceFolder}/src/server.js"],
      "env": {
        "BROWSERSTACK_USERNAME": "YOUR_BROWSERSTACK_USERNAME",
        "BROWSERSTACK_ACCESS_KEY": "YOUR_BROWSERSTACK_ACCESS_KEY",
        "BS_APP_REFERENCE": "bs://363cb761bf2fea6658dc6a17b4e0dd7a47a10df1"
      }
    }
  }
}
```

MCP server auto-starts when VS Code opens with GitHub Copilot active.

**Restart:** Ctrl+Shift+P → "Developer: Reload Window"

### Manual Start

```bash
node src/server.js
# Expected: "Appium MCP server with coverage analysis running"
```

### Run Tests

```bash
# All Wikipedia tests
npm run test:cucumber

# By tag
npx wdio wdio.conf.js --cucumberOpts.tags="@search"
npx wdio wdio.conf.js --cucumberOpts.tags="@smoke"
npx wdio wdio.conf.js --cucumberOpts.tags="@broken"

# Specific feature file
npx wdio wdio.conf.js --spec=features/wikipedia/search.feature

# Generate + open Allure report
npm run test:report
```

---

## ✅ What's Working

### MCP Server (7 Tools)
| Tool | Purpose |
|------|---------|
| `inspect_screen` | Analyze current app screen, return element tree + AI context |
| `smart_action` | Click/interact with elements using 7 fallback strategies |
| `gesture` | Tap, swipe, scroll, type with smart waits |
| `handle_firebase_auth` | Handle OTP/Firebase auth dialogs |
| `finalize_page` | Create/update page object for current screen |
| `analyze_gaps` | Identify untested elements and coverage gaps |
| `generate_cucumber` | Auto-generate BDD scenarios from screen state |

### Wikipedia Test Suite
- **`app-launch.feature`** — App startup and version dialog
- **`search.feature`** — 4 scenarios tagged `@smoke @wikipedia @search`
- **`article-navigation.feature`** — Article browsing
- **`Broken_Search.feature`** — 3 intentionally broken scenarios tagged `@search @broken` (POC demo)

### Tag Filtering (Fixed)
- `@search` correctly runs BOTH `search.feature` (4) + `Broken_Search.feature` (3) = 7 tests
- Root cause fixed: duplicate ambiguous step definition removed from `broken-steps-demo.js`

### CI/CD Pipeline
- GitHub Actions: `.github/workflows/ci.yml`
- Jobs: `lint` → `test` (BrowserStack + Allure) → `deploy-report` (GitHub Pages)
- JUnit XML artifacts uploaded per run
- Allure HTML report published to GitHub Pages

### Smart Automation
- **7 Element Resolution Strategies** (see `gestures/engine.js`)
- **Smart Waits** — zero race conditions
- **Navigation Tracking** — before/after page states captured
- **Session Reuse** — health-checked, auto-reconnects

### Hooks (`hooks.js`)
- `beforeScenario`: Sets dynamic BrowserStack session name → `[Wikipedia] [Feature: X] [Scenario: Y]`
- `afterScenario`: On failure — categorizes error type, generates MCP debug prompt, takes screenshot, calls `browser.reloadSession()` for session isolation

### Parallel Execution
- Configured and working in `wdio.conf.js`
- Test names display correctly per scenario on BrowserStack dashboard

---

## ⚠️ Known Issues / To Do

| Issue | Status | Notes |
|-------|--------|-------|
| `article-navigation.feature` scenarios failing | ❌ | Article page selectors need updating |
| Allure report not yet auto-published | ⚠️ | CI pipeline set up, needs GitHub Pages activation |
| `WikipediaArticlePage.js` selectors | ⚠️ | Need real resource-ids from inspect_screen |

---

## 🔑 Critical Information

### BrowserStack
- **Username:** `YOUR_BROWSERSTACK_USERNAME`
- **Access Key:** `YOUR_BROWSERSTACK_ACCESS_KEY`
- **App ID:** `bs://363cb761bf2fea6658dc6a17b4e0dd7a47a10df1`
- **Dashboard:** https://app-automate.browserstack.com/
- **Session Timeout:** 15 minutes idle

### Wikipedia Alpha — Real Element Selectors (from MCP `inspect_screen`)

**Version Warning Dialog:**
```
android:id/button1                          # "OK" dismiss button
```

**Main Feed:**
```
org.wikipedia.alpha:id/search_container     # Tappable search bar
org.wikipedia.alpha:id/search_text          # "Search Wikipedia" hint
```

**Search View:**
```
org.wikipedia.alpha:id/search_src_text      # Active search input
org.wikipedia.alpha:id/search_close_btn     # Close/back button
org.wikipedia.alpha:id/search_lang_button   # Language selector (shows "EN")
```

---

## 🧠 Architecture Reference

### 7 Element Resolution Strategies

```javascript
// gestures/engine.js — DO NOT MODIFY
const strategies = [
  () => driver.$(`//*[@text="${target}"]`),                                    // 1. Exact text
  () => driver.$(`//*[contains(@text, "${target}")]`),                         // 2. Partial text
  () => driver.$(`//*[@content-desc="${target}"]`),                            // 3. Exact content-desc
  () => driver.$(`//*[contains(@content-desc, "${target}")]`),                 // 4. Partial content-desc
  () => driver.$(`//*[contains(@resource-id, "${target}")]`),                  // 5. Resource ID
  () => driver.$(`android=new UiSelector().textContains("${target}")`),        // 6. UiAutomator2 text
  () => driver.$(`android=new UiSelector().descriptionContains("${target}")`)  // 7. UiAutomator2 desc
];
```

### Smart Wait Pattern

```javascript
await element.waitForDisplayed({ timeout: 5000 });
await element.waitForEnabled({ timeout: 5000 });
await element.click();
await driver.pause(1000); // Stabilization after interaction
```

### Session Reuse Pattern

```javascript
// session.js — checks health before creating new session
if (this.driver) {
  try {
    await this.driver.getPageSource(); // Health check
    return this.driver;                // Reuse
  } catch (e) {
    this.driver = null;                // Dead — recreate below
  }
}
```

---

## 📊 Sprint History

### Sprint 1 (✅ COMPLETE)
**Goal:** Prove AI-powered mobile testing works
- Custom MCP server with 7 tools
- VS Code integration
- BrowserStack connection (Android 15.0, Tab S10+)
- Smart wait logic (zero race conditions)
- 7 element resolution strategies

### Sprint 2 (✅ COMPLETE)
**Goal:** Wikipedia test suite foundation
- Wikipedia Alpha APK uploaded to BrowserStack
- Page objects: WikipediaMainPage, WikipediaSearchPage, WikipediaArticlePage
- Step definitions: wikipedia-steps.js, hooks.js
- Feature files: app-launch, search, article-navigation
- Broken demo steps for POC: broken-steps-demo.js, Broken_Search.feature

### Sprint 3 (🏃 IN PROGRESS)
**Goal:** POC demo-ready — CI/CD + Allure + Tag filtering correct
- GitHub Actions CI/CD pipeline
- Allure reports integration
- Tag filtering bug fixed (ambiguous step definition)
- Parallel execution verified
- Handover docs cleaned (this file)

---

## 📞 Support Resources

- **MCP-NAV:** `mcp-nav/WikiDiscovery.md` — replay-able MCP commands
- **DEV-JOURNAL:** `docs/DEV-JOURNAL.md` — full project history
- **BrowserStack Dashboard:** https://app-automate.browserstack.com/
- **GitHub Actions:** `.github/workflows/ci.yml`
