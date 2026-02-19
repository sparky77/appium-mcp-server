# AI Session Workflow

## 🎯 Starting a New Session

### Step 1: Load Context
```
1. Open SESSION-CONTEXT.md
2. Copy entire contents
3. Paste into new GitHub Copilot chat
4. AI now has full "personality chip"
```

**What the AI learns:**
- Project goals and tech stack
- Current test status
- MCP tools available
- Common issues & solutions
- User expectations

### Step 2: Check Current State
```powershell
# Get latest test results
Get-ChildItem reports/*.xml | Sort-Object LastWriteTime -Descending | Select-Object -First 1 | Get-Content

# Quick status
Get-ChildItem reports/*.xml | Sort-Object LastWriteTime -Descending | Select-Object -First 1 | Get-Content | Select-String -Pattern "tests="
```

### Step 3: Review Active TODO
See SESSION-CONTEXT.md "Active TODO" section for priorities

---

## 💬 Working with the AI

### Good Prompts
✅ "Fix search page selectors to use id= syntax"
✅ "Run all tests and show results summary"
✅ "Check latest test run and identify failures"
✅ "Update WikiDiscovery.md with new screen findings"

### Less Effective
❌ "How do I test?"
❌ "What should I do?"
❌ "Help me"

**Why**: AI has full context, be specific about what needs doing

---

## 🔄 After Making Changes

### 1. Run Relevant Tests
```powershell
# Single feature (fast feedback)
$env:BROWSERSTACK_USERNAME="$env:BROWSERSTACK_USERNAME"; $env:BROWSERSTACK_ACCESS_KEY="$env:BROWSERSTACK_ACCESS_KEY"; $env:BS_APP_REFERENCE="bs://363cb761bf2fea6658dc6a17b4e0dd7a47a10df1"; npx wdio wdio.conf.js --spec features/wikipedia/app-launch.feature

# Full suite (before committing)
$env:BROWSERSTACK_USERNAME="$env:BROWSERSTACK_USERNAME"; $env:BROWSERSTACK_ACCESS_KEY="$env:BROWSERSTACK_ACCESS_KEY"; $env:BS_APP_REFERENCE="bs://363cb761bf2fea6658dc6a17b4e0dd7a47a10df1"; npx wdio wdio.conf.js --spec features/wikipedia/*.feature
```

### 2. Update Documentation
- **SESSION-CONTEXT.md**: Update test status, last run timestamp
- **mcp-nav/test-registry.md**: Mark scenarios as passing/failing
- **mcp-nav/WikiDiscovery.md**: Add new screen discoveries

### 3. Commit Changes
```powershell
git add .
git commit -m "feat: descriptive message of what changed"
git push
```

---

## 📊 Monitoring Progress

### Test Metrics
- **Target for Demo**: 3-5 complete passing scenarios
- **Current**: 35 passing steps across 3 features
- **Goal**: App launch feature 100% passing (ACHIEVED ✅)

### Coverage Tracking
1. Check `mcp-nav/test-registry.md` for scenario status
2. Review `docs/TEST-COVERAGE-SUMMARY.md` for gaps
3. Update after each test run

---

## 🎭 Pre-Demo Checklist

**Day Before (Tonight)**
- [ ] Run full test suite
- [ ] Verify all app-launch scenarios pass
- [ ] Check BrowserStack session names
- [ ] Review WikiDiscovery.md for demonstration walkthrough
- [ ] Review demonstration guide (docs/DEMO-PLAYBOOK.md)

**Demonstration Readiness**
- [ ] Fresh test run validation
- [ ] MCP server running (for live demonstrations)
- [ ] BrowserStack dashboard accessible
- [ ] VS Code open to WikiDiscovery.md
- [ ] System operational 💪

---

## 🔧 Troubleshooting

### "AI doesn't remember previous conversation"
→ Paste SESSION-CONTEXT.md again

### "Tests failing after working earlier"
→ Check reports/*.xml for error details
→ Compare element selectors (~ vs id=)

### "MCP tools not responding"
→ Restart MCP server
→ Check http://localhost:3000

### "BrowserStack session names wrong"
→ Check wdio.conf.js beforeScenario hook
→ Verify quote escaping in session name

---

## 💡 Pro Tips

1. **Keep SESSION-CONTEXT.md Updated**: It's the AI's memory
2. **Run Tests Frequently**: Fast feedback loop
3. **Document Discoveries**: WikiDiscovery.md is demo gold
4. **Don't Overthink**: Working > Perfect for demo
5. **Trust the AI**: It has full context, let it work

---

**Remember**: The AI loaded with SESSION-CONTEXT.md knows everything. Just tell it what needs doing.
