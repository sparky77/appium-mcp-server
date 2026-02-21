# BrowserStack API MCP - Quick Reference

## Quick Command Reference

### 🔍 Query Test Results
```
Get test results                     → get_test_results
Get test results for "MCP POC"       → get_test_results (buildFilter: "MCP POC")
Get last 10 builds                   → get_test_results (limit: 10)
```

### 📦 Analyze Builds
```
Show all sessions in build           → get_build_sessions (buildId: "xyz123")
Get specific build details           → Use get_test_results, then get_build_sessions
```

### 🔬 Debug Sessions
```
Get session details                  → get_session_details (sessionId: "abc456")
Get session logs                     → get_session_logs (sessionId: "abc456")
Watch test video                     → Use publicUrl from session details
```

### 📊 Monitor Account
```
Check account limits                 → get_browserstack_plan
See parallel sessions used           → get_browserstack_plan
Check queue status                   → get_browserstack_plan
```

## Typical Workflows

### Workflow 1: Debug a Failed Test
1. `get_test_results` → Find failed sessions
2. `get_session_logs` (sessionId) → See exact error
3. Use `publicUrl` → Watch video of failure

### Workflow 2: Analyze Build Quality
1. `get_test_results` (limit: 10) → Get recent builds
2. `get_build_sessions` (buildId) → See all tests in a build
3. Compare pass rates across builds

### Workflow 3: Monitor Production Health
1. `get_test_results` (buildFilter: "Production") → Production builds only
2. `get_browserstack_plan` → Check if hitting limits
3. Track trends over time

## Response Structure Cheat Sheet

### get_test_results
```json
{
  "totalBuilds": 5,
  "builds": [
    {
      "buildId": "xyz",
      "buildName": "MCP POC run",
      "status": "done",
      "duration": 120,
      "sessions": [...]
    }
  ],
  "failedSessions": [...],
  "tip": "Use get_session_logs..."
}
```

### get_build_sessions
```json
{
  "buildId": "xyz",
  "totalSessions": 8,
  "passedSessions": 5,
  "failedSessions": 3,
  "sessions": [...],
  "tip": "X session(s) failed..."
}
```

### get_session_details
```json
{
  "sessionId": "abc",
  "name": "Search test",
  "status": "failed",
  "device": "Samsung Galaxy S21",
  "reason": "Element not found",
  "publicUrl": "https://...",
  "videoUrl": "https://...",
  "logs": "https://..."
}
```

### get_session_logs
```
Appium logs for session abc:

[HTTP] --> POST /session
[HTTP] --> POST /element
[W3C] Encountered internal error running command: NoSuchElementError
...
```

### get_browserstack_plan
```json
{
  "parallelSessions": 5,
  "parallelSessionsRunning": 2,
  "maxDuration": 1800,
  "queued": 0,
  "queuedMax": 5
}
```

## Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| "BrowserStack API not configured" | Missing credentials | Add BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY |
| "No builds found" | No test runs yet | Run tests with `npx wdio` first |
| "... truncated ..." | Logs too large | Normal - shows last 8000 chars with recent errors |

## Pro Tips

💡 **Use buildFilter** to focus on specific projects or features

💡 **Check publicUrl** for video - often faster than reading logs

💡 **Monitor parallelSessions** to avoid queuing issues

💡 **Save sessionIds** for failed tests to debug later

💡 **Use limit parameter** to reduce API calls and response size

## All 12 MCP Tools at a Glance

### Device Control (Need Active Session)
- inspect_screen
- smart_action
- gesture  
- handle_firebase_auth

### Coverage Analysis
- finalize_page
- analyze_gaps
- generate_cucumber

### BrowserStack API (No Session Needed)
- get_test_results ⭐
- get_build_sessions ⭐
- get_session_details ⭐
- get_session_logs ⭐
- get_browserstack_plan ⭐

---

**Need more detail?** See [BROWSERSTACK-API-MCP-GUIDE.md](./BROWSERSTACK-API-MCP-GUIDE.md)
