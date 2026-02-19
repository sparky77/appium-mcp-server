# Demo Workflow: Fix Broken Tests with MCP

**Objective:** Demonstrate MCP's ability to debug and fix failing mobile tests in real-time

---

## 🎬 Demo Script

### Phase 1: Show The Problem (5 minutes)

#### 1.1 Run Parallel Tests
```powershell
# Terminal 1: Run working + broken tests in parallel
.\run-tests.ps1 features/wikipedia/search.feature features/wikipedia/Broken_Search.feature
```

**Narration:**
> "Let's run our test suite. We have 8 scenarios total - 4 working tests in search.feature and 4 intentionally broken tests in Broken_Search.feature. Notice both features running in parallel on BrowserStack..."

**Expected Output:**
```
[0-0] RUNNING in android - features/wikipedia/search.feature
[0-1] RUNNING in android - features/wikipedia/Broken_Search.feature

[0-0] ✅ 4 scenarios (4 passed)
[0-1] ❌ 4 scenarios (4 failed)
```

#### 1.2 Show BrowserStack Dashboard
Navigate to BrowserStack and show:
- ✅ 2 sessions running simultaneously (parallel execution)
- ✅ "Wikipedia Search" build with 4 passed
- ❌ "Wikipedia Search - BROKEN" build with 4 failed

**Narration:**
> "Here in BrowserStack we can see both test sessions ran in parallel. Our working tests passed, but we have 4 failures. Let's use MCP to debug these in real-time..."

---

### Phase 2: MCP Debugging (10 minutes)

#### 2.1 Connect to Failed Test

**In Claude/Copilot Chat:**
```
I have failing tests in features/wikipedia/Broken_Search.feature. 
Let's debug them using MCP tools. First, show me what tests failed.
```

**Expected AI Response:**
Uses `grep_search` or `read_file` to show the broken feature file and identifies:
1. Broken selector scenario
2. Broken timing scenario
3. Wrong element ID scenario
4. State management scenario

#### 2.2 Inspect Live Screen (Scenario 1: Broken Selector)

**Chat:**
```
Let's start with "Search for an article - BROKEN SELECTOR". 
The test says it expects "No results found" but that seems wrong for a valid search term like "Albert Einstein".
Can you inspect the current screen state?
```

**AI Uses MCP Tool:**
```javascript
mcp_appiummcp_inspect_screen()
```

**Expected AI Analysis:**
> "I can see the screen shows search results for 'Albert Einstein'. The issue is in the feature file - line 17 expects 'No results found' but should expect search results instead. Let me fix this..."

**AI Fixes Feature File:**
Changes line 17 from:
```gherkin
Then I should see "No results found" message
```
To:
```gherkin
Then I should see search suggestions
```

#### 2.3 Fix Timing Issue (Scenario 2: Broken Wait)

**Chat:**
```
Now let's fix "Open search without proper wait". 
The error says it tries to verify too quickly after tapping.
```

**AI Uses:**
```javascript
read_file('src/cucumber/step-definitions/wikipedia/broken-steps-demo.js', lines 30-40)
```

**Expected AI Analysis:**
> "The step 'I tap the search container immediately' has no wait after the tap. The UI needs time to transition. Let me add a proper wait..."

**AI Fixes Step Definition:**
Adds `await browser.pause(1000);` after `mainPage.tapSearch()`

#### 2.4 Fix Wrong Selector (Scenario 3: Wrong Element)

**Chat:**
```
What about "Search with wrong element ID"? 
Can you inspect the page and find the correct search input selector?
```

**AI Uses:**
```javascript
mcp_appiummcp_inspect_screen()
mcp_appiummcp_smart_action({ action: "Find the search input field" })
```

**Expected AI Analysis:**
> "The step uses 'wrong_search_input' but the actual element ID is 'search_src_text'. Let me fix the selector..."

**AI Fixes:**
Changes `id=org.wikipedia.alpha:id/wrong_search_input` to correct selector

#### 2.5 Fix State Issue (Scenario 4: State Management)

**Chat:**
```
Last one: "Close search without opening". 
It tries to close search but search wasn't opened in Background steps.
```

**AI Suggests:**
> "The Background doesn't include opening search, but this scenario tries to close it. We need to add the prerequisite step..."

**AI Fixes Feature File:**
Adds:
```gherkin
Given I have opened the search view
```
Before the When step

---

### Phase 3: Verify Fixes (3 minutes)

#### 3.1 Re-run Tests

**Chat:**
```
All fixes applied! Let's re-run the broken tests to verify.
```

**Command:**
```powershell
.\run-tests.ps1 features/wikipedia/Broken_Search.feature
```

**Expected Output:**
```
[0-0] ✅ 4 scenarios (4 passed)
```

#### 3.2 Show BrowserStack

**Narration:**
> "Perfect! All 4 scenarios now pass. Let's check BrowserStack to confirm..."

**Show:**
- ✅ All 4 scenarios marked as PASSED
- ✅ Session videos show correct behavior
- ✅ No more errors

---

### Phase 4: Demonstrate Repeatability (2 minutes)

**Narration:**
> "To make this demo repeatable, I've created a reset script that restores the broken state..."

**Show:**
```powershell
.\scripts\reset-demo.ps1
```

**Explain:**
> "This copies the broken versions back, so we can run this demo again anytime. All fixes are saved in a 'demo-fixed' backup folder."

---

## 🎯 Key Demo Messages

### What This Demonstrates

1. **Parallel Execution:**
   - Multiple feature files run simultaneously
   - Efficient use of BrowserStack sessions
   - Faster feedback loops

2. **MCP Debugging Power:**
   - Real-time screen inspection
   - Element discovery without manual inspection
   - Context-aware suggestions

3. **AI-Guided Fixing:**
   - Understands test intent vs implementation
   - Identifies root causes (not just symptoms)
   - Suggests correct fixes with rationale

4. **Repeatability:**
   - Demo can be reset and run again
   - No manual cleanup needed
   - Perfect for presentations/training

---

## 📋 Pre-Demo Checklist

- [ ] BrowserStack credentials configured
- [ ] Wikipedia Alpha app uploaded to BrowserStack
- [ ] All features can run (test once before demo)
- [ ] Claude Desktop / Copilot MCP server connected
- [ ] BrowserStack dashboard open in browser
- [ ] Terminal windows prepared
- [ ] Reset script ready
- [ ] Backup of working versions created

---

## 🔄 Demo Reset Instructions

### To Reset Demo (Restore Broken State)
```powershell
.\scripts\reset-demo.ps1
```

### To Save Current Fixed State
```powershell
.\scripts\backup-demo-fixes.ps1
```

---

## 💡 Demo Tips

1. **Timing:** Full demo ~20 minutes (adjust based on audience)
2. **Backup Plan:** If MCP doesn't respond, have fixes pre-written
3. **Audience Engagement:** Ask "What would you check first?" before using MCP
4. **Show Terminal:** Keep terminal visible to show parallel execution logs
5. **BrowserStack Window:** Have dashboard open on second monitor

---

## 🎬 One-Liner Demo Commands

### Quick Demo Run (All Steps)
```powershell
# 1. Run parallel tests (show failures)
.\run-tests.ps1 features/wikipedia/*.feature

# 2. After AI fixes applied, re-run
.\run-tests.ps1 features/wikipedia/Broken_Search.feature

# 3. Reset for next demo
.\scripts\reset-demo.ps1
```

---

## 📊 Expected Results Summary

| Scenario | Initial State | After MCP Fix |
|----------|---------------|---------------|
| Broken Selector | ❌ Wrong assertion | ✅ Correct assertion |
| Broken Wait | ❌ Race condition | ✅ Proper timing |
| Wrong Element | ❌ Invalid selector | ✅ Correct selector |
| State Issue | ❌ Missing prerequisite | ✅ Complete flow |

**Total:** 0/4 passing → 4/4 passing 🎉
