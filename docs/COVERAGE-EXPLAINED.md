# Coverage Tracking - Explained

## 🎯 Two Types of Coverage

### 1. **MCP Tool Coverage** (Real-time, In-Memory)

**What it tracks:**
- Elements discovered via `inspect_screen`
- Actions performed via `gesture`, `smart_action`
- Page navigation tracked by MCP server
- Coverage percentages calculated live

**How it works:**
```javascript
// src/coverage/analyzer.js
class CoverageAnalyzer {
  constructor() {
    this.pages = new Map();  // In-memory storage
    this.globalCoverage = {
      totalElements: 0,
      testedElements: 0
    };
  }
}
```

**Limitations:**
- ❌ **Not persisted** - Resets when MCP server restarts
- ❌ **Only tracks MCP tool usage** - Doesn't see regular test runs
- ❌ **In-memory only** - No file output or database
- ✅ **Real-time** - Updates instantly during MCP exploration

**When it shows 0%:**
- Server just restarted
- No MCP tools used yet (`inspect_screen`, `gesture`, etc.)
- You're running tests via `npx wdio` (bypasses MCP)

---

### 2. **Cucumber Test Coverage** (Documented, Persistent)

**What it tracks:**
- Implemented step definitions
- Passing/failing scenarios
- Test execution results
- Feature file completeness

**How it works:**
- Run tests: `npx wdio wdio.conf.js`
- Results saved to `reports/*.xml`
- Coverage documented in:
  - `mcp-nav/app-map.md`
  - `docs/TEST-COVERAGE-SUMMARY.md`
  - Feature file status comments

**Current Status (v0.3.0):**
```
Wikipedia Test Suite:
✅ App Launch: 19 steps passing
⚠️  Search: 18 passing, 4 failing (selector issues)
❌ Article Nav: 3 scenarios failing
🆕 Language Settings: 2 scenarios (broken for demo)

Overall: 35 passing, 10 failing, 11 skipped
Coverage: ~18% (7 of 40 elements tested)
```

**When to use:**
- ✅ CI/CD pipelines
- ✅ Release readiness checks
- ✅ Team reporting
- ✅ Historical tracking

---

## 🤔 Why Does It Say 0% Everywhere?

### Scenario 1: Running Tests via npx wdio
```powershell
# This bypasses MCP server entirely
npx wdio wdio.conf.js --spec features/wikipedia/app-launch.feature
```

**Result:**
- ✅ Tests execute on BrowserStack
- ✅ Results saved to reports/
- ❌ MCP CoverageAnalyzer not updated (it's not involved)
- Shows 0% in MCP coverage (because MCP wasn't used)

### Scenario 2: Using MCP Tools
```
You: "Use inspect_screen to analyze the Wikipedia main feed"
AI: Calls mcp_appiummcp_inspect_screen
```

**Result:**
- ✅ MCP server executes tool
- ✅ CoverageAnalyzer.trackScreen() called
- ✅ Coverage updated in-memory
- Coverage shows actual % (e.g., "17 elements discovered")

---

## 📊 Which Coverage Should You Trust?

### For Your Situation:

**Trust Cucumber Test Coverage** because:
1. You're running tests via `npx wdio` (not MCP)
2. Results are persisted in `reports/` and BrowserStack
3. This represents actual CI/CD test coverage
4. Feature files document what's implemented

**MCP Coverage is for:**
1. Live exploration with Copilot/Claude
2. "What elements exist vs what we've tested via MCP"
3. Gap analysis during manual exploration
4. Temporary session-based tracking

---

## 🔧 How to View Actual Coverage

### Current Test Results:

**Check Latest Report:**
```powershell
Get-ChildItem reports/*.xml | Sort-Object LastWriteTime -Descending | Select-Object -First 1 | Get-Content
```

**Check BrowserStack:**
https://automate.browserstack.com/dashboard

**Check Feature Files:**
- [features/wikipedia/app-launch.feature](../features/wikipedia/app-launch.feature) - ✅ 100% implemented
- [features/wikipedia/search.feature](../features/wikipedia/search.feature) - ⚠️ 4 failing steps (selector issues)
- [features/wikipedia/article-navigation.feature](../features/wikipedia/article-navigation.feature) - ❌ Needs work

---

## 💡 Recommendation

**Update app-map.md manually** based on:
1. What's in your feature files
2. What passes/fails in test runs
3. Page objects that exist

**Don't rely on MCP coverage** for reporting because:
- It's ephemeral (in-memory only)
- Only tracks MCP tool usage
- Resets on server restart

**MCP coverage is useful for:**
- Live AI-guided exploration
- "What should I test next?" suggestions
- Real-time gap analysis during chat sessions

---

## 📝 Current Coverage Summary

**Wikipedia App (v0.3.0):**

| Screen | Elements | Tested | Coverage |
|--------|----------|--------|----------|
| Main Feed | 17 | 4 | 24% |
| Search View | 15 | 2 | 13% |
| Article Page | 8 | 1 | 13% |
| **TOTAL** | **40** | **7** | **18%** |

**Source:** Cucumber test execution + implemented step definitions

**Last Run:** February 18, 2026  
**Test Suite:** 35 passing, 10 failing, 11 skipped

---

**TL;DR:**
- **MCP Coverage** = In-memory, for AI exploration, resets on restart
- **Test Coverage** = Persistent, from `npx wdio` runs, documented in reports
- **Use Test Coverage** for actual metrics and reporting
- **Use MCP Coverage** for real-time exploration guidance
