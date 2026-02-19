# Project Folder Structure

## 📁 Standard Organization

```
appium-mcp-server/
├── src/                          # Framework source code
│   ├── server.js                 # MCP server
│   ├── appium/                   # Appium session management
│   ├── gestures/                 # Gesture engine
│   ├── analysis/                 # Screen analyzer
│   ├── coverage/                 # Coverage tracking
│   ├── cucumber/                 # Cucumber integration
│   │   ├── generator.js          # Feature file generator
│   │   └── step-definitions/     # Step implementations
│   └── page-objects/             # Page Object Model classes
│
├── features/                     # Cucumber feature files (tests)
│   ├── wikipedia-poc.feature     # POC demo tests
│   ├── poc-minimal.feature       # Minimal test
│   └── examples/                 # Example feature templates
│
├── scripts/                      # Development & utility scripts
│   ├── inspect-screen.js         # MCP screen inspector
│   ├── upload-app.sh             # BrowserStack app upload
│   └── clean-reports.sh          # Report cleanup
│
├── examples/                     # Example templates for reference
│   └── example-test.js           # Standalone test template
│
├── docs/                         # Project documentation
│   ├── DEV-JOURNAL.md            # Development history
│   ├── SPRINT-*.md               # Sprint plans
│   ├── SETUP.md                  # Installation guide
│   ├── START-SERVER.md           # Server startup
│   └── CONTEXT-SWITCHING-PATTERNS.md
│
├── mcp-nav/                      # MCP Handover Documentation
│   ├── README.md                 # Overview of handover docs
│   ├── handover-prompt.md        # Complete context for new sessions
│   ├── project-context.md        # Stack, status, structure
│   ├── app-map.md                # Screen mappings & element selectors
│   ├── test-registry.md          # Feature files & step tracking
│   ├── decisions.md              # Architectural decisions
│   └── Demo-brief                # Demo preparation notes
│
├── reports/                      # Test execution results (gitignored)
│   └── *.xml                     # JUnit XML reports
│
├── allure-results/               # Allure raw data (gitignored)
│   └── *.json                    # Allure test results
│
├── allure-report/                # Allure HTML report (gitignored)
│
├── .github/                      # GitHub configuration
│   └── workflows/
│       └── ci.yml                # CI/CD pipeline
│
├── .vscode/                      # VS Code settings
│   └── mcp.json                  # MCP server integration
│
├── node_modules/                 # Dependencies (gitignored)
├── .env                          # Environment variables (gitignored)
├── .gitignore                    # Git exclusions
├── package.json                  # Project metadata & scripts
├── wdio.conf.js                  # WebdriverIO configuration
│
├── README.md                     # Main documentation
├── PROJECT-FLIGHT-PATH.md        # Sprint roadmap & timeline
├── QUICK-START-CHECKLIST.md     # Getting started guide
├── POC-TIMELINE.md               # POC demo plan
├── POC-READY.md                  # POC checklist
└── TEST-COVERAGE-SUMMARY.md     # Coverage metrics
```

---

## 📂 Folder Purposes

### `/src/` - Framework Code
**Purpose:** Core framework implementation
**Contents:** MCP server, analyzers, engines, page objects
**Rule:** Production code only, no test scripts here

### `/features/` - Test Scenarios
**Purpose:** Cucumber feature files (Gherkin tests)
**Contents:** Feature files organized by functionality
**Rule:** Business-readable test scenarios

### `/scripts/` - Development Tools
**Purpose:** Development utilities and helper scripts
**Contents:**
- Screen inspection tools
- App upload scripts
- Database seeders
- Report cleaners
**Rule:** NOT part of test execution, dev tools only

### `/examples/` - Templates
**Purpose:** Reference examples for developers
**Contents:** Example page objects, tests, features
**Rule:** Template files, not executed

### `/docs/` - Documentation
**Purpose:** Project documentation and guides
**Contents:** Setup guides, dev journals, sprint docs
**Rule:** Markdown documentation only

### `/mcp-nav/` - Handover Documentation
**Purpose:** AI session handover and context transfer
**Contents:**
- `handover-prompt.md` - Complete context for new Claude sessions
- `project-context.md` - Current state, stack, structure
- `app-map.md` - Screen elements and selectors
- `test-registry.md` - Test inventory and coverage
- `decisions.md` - Why we made architectural choices
**Rule:** Living documentation for context continuity

### `/reports/` - Test Results
**Purpose:** Generated test reports
**Rule:** Auto-generated, gitignored

### `/.github/` - CI/CD
**Purpose:** GitHub Actions workflows
**Rule:** Pipeline definitions only

---

## 🎯 Where Things Go

| Item | Folder | Example |
|------|--------|---------|
| MCP Server | `/src/` | `server.js` |
| Page Objects | `/src/page-objects/` | `WikipediaPage.js` |
| Step Definitions | `/src/cucumber/step-definitions/` | `wikipedia-steps.js` |
| Feature Files | `/features/` | `wikipedia-poc.feature` |
| Dev Scripts | `/scripts/` | `inspect-screen.js` |
| Example Templates | `/examples/` | `example-test.js` |
| Documentation | `/docs/` | `SETUP.md` |
| Handover Docs | `/mcp-nav/` | `handover-prompt.md` |
| Root-level | `/` | `README.md`, `package.json` |

---

## 📝 Naming Conventions

### Files
- **Scripts:** `kebab-case.js` (e.g., `inspect-screen.js`)
- **Page Objects:** `PascalCase.js` (e.g., `WikipediaPage.js`)
- **Step Definitions:** `kebab-case.js` (e.g., `wikipedia-steps.js`)
- **Features:** `kebab-case.feature` (e.g., `login-flow.feature`)
- **Docs:** `UPPERCASE.md` (e.g., `README.md`)

### Folders
- **lowercase** for all folders
- **kebab-case** for multi-word (e.g., `step-definitions`)

---

## 🚫 What NOT to Put in Root

❌ Test scripts
❌ Inspection tools
❌ Temporary files
❌ One-off utilities

✅ Only configuration files (package.json, wdio.conf.js, .env)
✅ Only top-level documentation (README.md, PROJECT-FLIGHT-PATH.md)

---

## 🔄 mcp-nav/ Folder Details

**Purpose:** Handover documentation for AI context continuity

**When to Update:**
- `handover-prompt.md` - After major milestones or before handover
- `project-context.md` - After stack changes or sprint completion
- `app-map.md` - After discovering new screens/elements
- `test-registry.md` - After adding/updating tests
- `decisions.md` - After making architectural decisions

**NOT for:**
- ❌ Source code
- ❌ Test scripts
- ❌ Dev utilities
- ✅ Only documentation and context

---

This structure follows industry standards and keeps the project clean and maintainable.
