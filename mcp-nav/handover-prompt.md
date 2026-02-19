# HANDOVER PROMPT - Copy & Paste Into New Claude Session

**Purpose:** Instantly restore full context for Appium MCP Server development

**Last Updated:** February 18, 2026

---

## 📋 COPY EVERYTHING BELOW THIS LINE

You are taking over development of the **Appium MCP Server** — a custom Model Context Protocol server that enables AI-powered mobile app testing. Instead of writing traditional Appium test code, users talk to GitHub Copilot/Claude in natural language, and it intelligently tests their mobile app on BrowserStack.

---

## 🎯 PROJECT IDENTITY

**Name:** Appium MCP Server
**Version:** 0.3.0 (Wikipedia POC)
**Purpose:** Bridge conversational AI ↔ mobile app testing
**Innovation:** First AI-driven mobile test framework with live coverage tracking
**Demo App:** Wikipedia Alpha (Android)

**The Magic:**
```
User: "Test the search feature"
AI:  → Inspects screen
     → Finds search container
     → Taps to open search
     → Enters search text
     → Validates results
     → Generates Cucumber scenarios
     → Reports coverage gaps
```

**What Makes This Special:**
- ✅ **Conversational:** Natural language testing (no code writing)
- ✅ **Intelligent:** AI discovers elements and flows automatically
- ✅ **Self-Documenting:** Every action generates Cucumber scenarios
- ✅ **Coverage-Aware:** Knows what's tested, what's not
- ✅ **Zero Race Conditions:** Smart waits + 7 element resolution strategies

---

## 📦 TECH STACK

**Runtime:** Node.js v22.17.1
**MCP SDK:** @modelcontextprotocol/sdk@1.17.0
**WebdriverIO:** 9.18.4 (Appium client)
**Cucumber:** @wdio/cucumber-framework@9.18.0
**Reporters:** @wdio/allure-reporter, @wdio/spec-reporter, @wdio/junit-reporter
**IDE:** VS Code 1.108.2 with GitHub Copilot 1.102+
**Infrastructure:** BrowserStack App Automate
**Device:** Samsung Galaxy Tab S10 Plus (Android 15.0)
**App:** Wikipedia Alpha mobile app
**App ID:** `bs://363cb761bf2fea6658dc6a17b4e0dd7a47a10df1`

---

## 📁 PROJECT STRUCTURE

```
d:\Apps\appium-mcp-server\
├── src/
│   ├── server.js                        # MCP server (7 tools)
│   ├── appium/session.js                # BrowserStack connection
│   ├── gestures/engine.js               # 7-strategy element finder
│   ├── analysis/screen.js               # Screen analyzer
│   ├── coverage/analyzer.js             # Coverage tracker
│   ├── cucumber/generator.js            # Auto-generates features
│   └── page-objects/wikipedia/
│       ├── WikipediaMainPage.js         # Main feed page object
│       ├── WikipediaSearchPage.js       # Search view page object
│       └── WikipediaArticlePage.js      # Article page object
│   └── cucumber/step-definitions/wikipedia/
│       ├── wikipedia-steps.js           # Main step definitions
│       ├── hooks.js                     # Before/After hooks (shared)
│       └── broken-steps-demo.js        # Intentionally broken steps (demo)
├── features/wikipedia/
│   ├── app-launch.feature               # App startup scenarios
│   ├── search.feature                   # @search @smoke @wikipedia
│   ├── article-navigation.feature       # Article browsing
│   └── Broken_Search.feature           # @search @broken - demo broken steps
├── scripts/
│   ├── fetch-test-results.js           # BrowserStack results fetcher
│   ├── generate-dashboard.js           # Dashboard generator
│   └── inspect-wikipedia.js            # Screen inspection script
├── docs/                                # All documentation (archived)
├── mcp-nav/                             # AI handover + navigation docs
│   ├── handover-prompt.md              # (you are here)
│   ├── project-context.md              # Technical reference
│   ├── WikiDiscovery.md                # MCP-driven discovery log
│   ├── app-map.md                      # Screen/element map
│   └── test-registry.md                # Feature coverage matrix
├── .github/workflows/ci.yml            # GitHub Actions CI/CD
├── wdio.conf.js                         # Cucumber test runner config
├── .vscode/mcp.json                    # VS Code MCP integration (CRITICAL)
└── reports/                             # JUnit XML + Allure output
```

---

## 🚀 HOW TO START THE SERVER

### VS Code Integration (Primary)

The MCP server auto-starts when you open this workspace in VS Code with GitHub Copilot.

**Config:** `.vscode/mcp.json`
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

**Verify:** Ask Claude/Copilot "use inspect_screen" and it should call the MCP tool.

**Restart:** Reload VS Code (Ctrl+Shift+P → "Developer: Reload Window")

### Manual Start (Testing)

```bash
node src/server.js
```

Expected: `Appium MCP server with coverage analysis running`

### Run Cucumber Tests

```bash
# All tests
npm run test:cucumber

# By tag (e.g. search tests across ALL matching feature files)
npx wdio wdio.conf.js --cucumberOpts.tags="@search"

# Specific feature
npx wdio wdio.conf.js --spec=features/wikipedia/search.feature

# Generate Allure report
npm run test:report
```

---

## 🎯 CURRENT STATUS (Sprint 3 - Wikipedia POC)

### ✅ WHAT'S WORKING

**MCP Server:**
- 7 tools: `inspect_screen`, `gesture`, `smart_action`, `handle_firebase_auth`, `finalize_page`, `analyze_gaps`, `generate_cucumber`
- VS Code / Claude Code integration functional
- BrowserStack connection stable (Android 15.0, Tab S10+)

**Wikipedia Test Suite:**
- `app-launch.feature` — scenarios running on BrowserStack
- `search.feature` — 4 scenarios (`@smoke @wikipedia @search`)
- `Broken_Search.feature` — 3 intentionally broken scenarios for demo (`@search @broken`)
- Tag filtering works: `@search` correctly picks up BOTH search feature files
- Test naming works: BrowserStack session names show correct scenario names
- Parallel execution enabled and working

**CI/CD:**
- GitHub Actions workflow in `.github/workflows/ci.yml`
- Jobs: lint → test (BrowserStack + Allure) → deploy-report (GitHub Pages)
- Allure reports configured and generating

**Framework:**
- Page objects: `WikipediaMainPage.js`, `WikipediaSearchPage.js`, `WikipediaArticlePage.js`
- Hooks in `hooks.js`: dynamic session naming, failure screenshots, MCP debug prompts
- `ignoreUndefinedDefinitions: false` strict mode active

### ✅ CRITICAL BUG FIXED (Tag Filtering)

**Problem:** `--cucumberOpts.tags="@search"` only ran `Broken_Search.feature` (3 tests) instead of 7 tests total.

**Root Cause:** `broken-steps-demo.js` had a duplicate step `When('I tap the close button')` — same as in `wikipedia-steps.js`. This ambiguous definition caused `search.feature` to fail at compile stage silently.

**Fix Applied:**
- Renamed step in `broken-steps-demo.js` to `'I tap the close button without opening search first'`
- Updated `Broken_Search.feature` scenario to match

**Result:** Both feature files now run with `@search` tag = 7 tests total (4 + 3).

---

## 🔑 CRITICAL INFORMATION

### BrowserStack
- **Dashboard:** https://app-automate.browserstack.com/
- **Username:** `YOUR_BROWSERSTACK_USERNAME`
- **Access Key:** `YOUR_BROWSERSTACK_ACCESS_KEY`
- **App ID:** `bs://363cb761bf2fea6658dc6a17b4e0dd7a47a10df1`
- **Interactive View:** Enabled (watch tests live)
- **Session Timeout:** 15 minutes

### Wikipedia App Element Selectors (Real, from MCP inspect_screen)

**Version Warning Dialog:**
- Dismiss button: `android:id/button1` (resource-id)

**Main Feed:**
- Search container: `org.wikipedia.alpha:id/search_container`
- Search hint text: `org.wikipedia.alpha:id/search_text` (text: "Search Wikipedia")

**Search View:**
- Search input field: `org.wikipedia.alpha:id/search_src_text`
- Close/back button: `org.wikipedia.alpha:id/search_close_btn`
- Language selector: `org.wikipedia.alpha:id/search_lang_button`

---

## 🧠 ARCHITECTURAL KNOWLEDGE

### 7 Element Resolution Strategies (DO NOT MODIFY)

```javascript
// From gestures/engine.js
const strategies = [
  () => driver.$(`//*[@text="${target}"]`),
  () => driver.$(`//*[contains(@text, "${target}")]`),
  () => driver.$(`//*[@content-desc="${target}"]`),
  () => driver.$(`//*[contains(@content-desc, "${target}")]`),
  () => driver.$(`//*[contains(@resource-id, "${target}")]`),
  () => driver.$(`android=new UiSelector().textContains("${target}")`),
  () => driver.$(`android=new UiSelector().descriptionContains("${target}")`)
];
```

### Smart Wait Pattern (Zero Race Conditions)

```javascript
// Always do this:
await element.waitForDisplayed({ timeout: 5000 });
await element.waitForEnabled({ timeout: 5000 });
await element.click();
await driver.pause(1000);  // Stabilization

// Never do this:
await driver.pause(3000);  // Hope-based timing
await element.click();
```

### Session Reuse Pattern

```javascript
// AppiumSession.getDriver() reuses existing session or creates new
async getDriver() {
  if (this.driver) {
    try {
      await this.driver.getPageSource();  // Health check
      return this.driver;                  // Reuse existing
    } catch (e) {
      this.driver = null;                  // Recreate if dead
    }
  }
}
```

---

## 🛡️ WHAT NOT TO BREAK

### DO NOT MODIFY (Working Perfectly):
1. `gestures/engine.js` — 7 element strategies
2. `appium/session.js` — session management with health checks
3. `wdio.conf.js` — BrowserStack capabilities (Android 15, Tab S10+)
4. `.vscode/mcp.json` — VS Code MCP integration
5. `hooks.js` — Before/After hooks (session naming, failure handling)

### DO NOT REVERT:
1. `exports.config` (not `module.exports`) in `wdio.conf.js`
2. `browser` global (not `this.driver`) in step definitions
3. `maxInstances: 1` or parallel config as set
4. `ignoreUndefinedDefinitions: false` (strict mode)
5. Step name uniqueness — never have two step defs with the same pattern

---

## 💡 DEVELOPMENT PRINCIPLES

1. **AI-First:** Every tool provides rich context to AI
2. **Zero Race Conditions:** Smart waits are non-negotiable
3. **Self-Documenting:** Code generates test scenarios
4. **No Duplicate Steps:** Ambiguous step definitions silently break tag filtering
5. **Fail Fast:** Strict mode catches issues early
6. **Session Reuse:** Don't create new sessions unnecessarily
7. **Scripts In scripts/:** Never dump scripts in the project root

---

## 📚 DOCUMENTATION REFERENCE

| File | Purpose |
|------|---------|
| `mcp-nav/project-context.md` | Full technical reference |
| `mcp-nav/WikiDiscovery.md` | MCP-driven screen discovery log |
| `mcp-nav/app-map.md` | Screen/element map |
| `mcp-nav/test-registry.md` | Feature coverage matrix |
| `docs/DEV-JOURNAL.md` | Project history |
| `docs/SPRINT-1-COMPLETE.md` | Sprint 1 summary |

---

## 📎 METADATA

- **Last Updated:** February 18, 2026
- **Version:** 0.3.0 (Wikipedia POC)
- **Sprint:** 3 (Wikipedia test suite active)
- **Demo App:** Wikipedia Alpha on BrowserStack
- **Status:** 🟢 Active — CI working, tag filtering fixed, demo-ready

---

**Welcome back. Let's build something amazing.**
