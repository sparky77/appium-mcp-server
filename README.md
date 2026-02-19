# Appium MCP Server - Wikipedia POC

## 🎯 Project Overview

A **custom-built Model Context Protocol (MCP) server** that enables AI-powered mobile test automation against the **Wikipedia Android Alpha APK** running on real devices via BrowserStack App Automate.

> **Important**: This is a **SERVER-SIDE** project. The MCP config (`claude_desktop_config.json`) lives on the **CLIENT SIDE** in Claude Desktop's config folder.

## 🚀 Quick Start

> **⚡ Quick Answer:** See **[START-SERVER.md](./docs/START-SERVER.md)** for step-by-step instructions!

1. **Install dependencies**: `npm install`
2. **Set credentials**: Copy `.env.example` to `.env` and fill in your BrowserStack details
3. **Add to Claude Desktop config** (see [SETUP.md](./SETUP.md) or [START-SERVER.md](./docs/START-SERVER.md))
4. **Restart Claude Desktop**
5. **Start using the tools** in your Claude conversations!

---

## 🏗️ Architecture

```
┌─────────────────────┐         stdio          ┌──────────────────────┐
│  Claude Desktop /   │ ◄──────────────────► │  Appium MCP Server   │
│  VS Code Copilot    │                        │  (server.js)         │
│                     │                        │                      │
│  mcp.json or        │                        │  - Device control    │
│  claude_desktop_    │                        │  - Screen analysis   │
│  config.json        │                        │  - Test generation   │
└─────────────────────┘                        └──────────────────────┘
                                                         │
                                                         │ HTTPS
                                                         ▼
                                               ┌──────────────────────┐
                                               │  BrowserStack        │
                                               │  App Automate        │
                                               │  Real Android Device │
                                               │  (Samsung Galaxy S21)│
                                               │  Wikipedia Alpha APK │
                                               └──────────────────────┘
```

### Project Structure

```
appium-mcp-server/
├── src/
│   ├── server.js                    # Main MCP server
│   ├── appium/
│   │   └── session.js              # BrowserStack connection management
│   ├── analysis/
│   │   └── screen.js               # Screen analyzer
│   ├── gestures/
│   │   └── engine.js               # Gesture execution (tap, swipe, scroll)
│   ├── coverage/
│   │   └── analyzer.js             # Coverage gap analysis
│   └── cucumber/
│       ├── generator.js            # Auto-generate Cucumber features
│       └── step-definitions/
│           └── common-steps.js     # Reusable step definitions
├── features/
│   └── wikipedia/                  # Wikipedia POC test scenarios
│       ├── app-launch.feature      # App launch & language selection
│       └── search.feature          # Search functionality (pass + demo failures)
├── scripts/
│   ├── browserstack-api.js         # BrowserStack App Automate REST API client
│   ├── fetch-test-results.js       # CLI: fetch and display test results
│   └── generate-dashboard.js      # Generate HTML test dashboard
├── reports/                        # Test execution reports (gitignored)
├── wdio.conf.js                    # WebdriverIO + Cucumber config
├── claude_desktop_config.example.json
└── package.json
```

---

## 🛠️ MCP Tools Available

### 1. **inspect_screen**
- Analyzes current mobile screen
- Lists all visible elements with selectors
- Tracks test coverage automatically

### 2. **smart_action**
- Natural language commands: `"tap search button"`, `"scroll down"`
- Finds elements using 7-strategy fallback chain
- Tracks coverage for each action

### 3. **gesture**
- Execute specific gestures: `tap`, `swipe`, `scroll`, `long_press`
- Target elements by description or XPath

### 4. **finalize_page**
- Complete page coverage analysis
- Elements tested vs total, coverage percentage, gap analysis

### 5. **analyze_gaps**
- Identify untested elements and missing scenarios
- Prioritized recommendations (high/medium/low)

### 6. **generate_cucumber**
- Auto-generate Cucumber feature files from screen exploration
- Ready to run with WebdriverIO

### 7. **handle_firebase_auth**
- Handles webview-based authentication flows
- Context switching between NATIVE and WEBVIEW

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file:
```bash
BROWSERSTACK_USERNAME=your_username
BROWSERSTACK_ACCESS_KEY=your_access_key
BS_APP_REFERENCE=bs://your_app_hash
```

### Claude Desktop Config

Add to `%APPDATA%\Claude\claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "appiumMCP": {
      "command": "node",
      "args": ["d:\\Apps\\appium-mcp-server\\src\\server.js"],
      "env": {
        "BROWSERSTACK_USERNAME": "YOUR_BROWSERSTACK_USERNAME",
        "BROWSERSTACK_ACCESS_KEY": "YOUR_BROWSERSTACK_ACCESS_KEY",
        "BS_APP_REFERENCE": "bs://YOUR_APP_HASH"
      }
    }
  }
}
```

> **📄 See `claude_desktop_config.example.json` for a copy-paste ready template**

### VS Code Integration

Add to `.vscode/mcp.json`:
```json
{
  "mcpServers": {
    "appiumMCP": {
      "command": "node",
      "args": ["d:\\Apps\\appium-mcp-server\\src\\server.js"]
    }
  }
}
```

Credentials are read from `.env` file automatically.

---

## 🚀 Running Tests

### Run Wikipedia POC tests
```bash
npx wdio wdio.conf.js
```

### Run specific tags
```bash
# Search tests only
npx wdio wdio.conf.js --cucumberOpts.tags="@search"

# Demo failures (broken tests for MCP fix demonstration)
npx wdio wdio.conf.js --cucumberOpts.tags="@broken"
```

### Fetch test results from BrowserStack
```bash
node scripts/fetch-test-results.js
```

### Generate HTML dashboard
```bash
node scripts/generate-dashboard.js
```

---

## 📊 Test Structure

### Wikipedia Features
- **`@search`** - 3 passing search tests (python, javascript, machine learning)
- **`@broken`** - 3 intentionally broken tests (demo: MCP identifies + fixes failures)
- **`@app-launch`** - App launch and language selection

### BrowserStack Configuration
- **Device**: Samsung Galaxy S21
- **OS**: Android 12.0
- **Project**: MCP Testing
- **Build**: Build 1.0

---

## 🔍 Troubleshooting

### MCP Server Not Showing in Claude Desktop?
1. Verify config file path and JSON syntax (no trailing commas)
2. Use double backslashes `\\` in Windows paths
3. Restart Claude Desktop completely (check Task Manager)
4. Check logs: `%APPDATA%\Claude\logs\`

### BrowserStack Connection Issues?
1. Verify credentials in `.env` or config JSON
2. Check app is uploaded: `BS_APP_REFERENCE` must match uploaded APK hash
3. Confirm BrowserStack App Automate plan is active

### Test Server Manually
```bash
node src/server.js
# Should output: "Appium MCP server with coverage analysis running"
```

---

## 📦 Dependencies

- `@modelcontextprotocol/sdk` - MCP server framework
- `webdriverio` - Appium automation
- `@wdio/cucumber-framework` - Cucumber BDD integration
- `@wdio/allure-reporter` - Allure test reports
- `@wdio/junit-reporter` - JUnit XML reports

---

**Built for the Appium MCP POC demonstration**
