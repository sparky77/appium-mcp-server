# BrowserStack API MCP - Setup Guide

## Overview

The Appium MCP Server now includes **comprehensive BrowserStack API tools** that allow you to query test results, debug failures, and monitor account usage **without needing an active Appium session**.

## What's Included

The server provides 12 MCP tools total:
- **4 Device Control Tools** (require active Appium session)
- **3 Coverage Analysis Tools** 
- **5 BrowserStack API Tools** (work independently, no session needed)

## BrowserStack API Tools

### 1. **get_test_results**
Fetch recent BrowserStack builds with pass/fail summary.

**Parameters:**
- `buildFilter` (optional): Filter by project/build name (e.g., "MCP POC run")
- `limit` (optional): Number of builds to fetch (default: 5, max: 20)

**Returns:**
- List of recent builds
- Session counts (passed/failed)
- Session IDs for further investigation
- Public URLs for video playback

**Example Use:**
```
Get my recent test results from BrowserStack
```

### 2. **get_build_sessions**
Get all test sessions for a specific build with detailed status.

**Parameters:**
- `buildId` (required): BrowserStack build ID from get_test_results

**Returns:**
- Complete list of sessions in the build
- Device information for each session
- Status, duration, and failure reasons
- Video and log URLs

**Example Use:**
```
Show me all sessions for build xyz123
```

### 3. **get_session_details**
Get detailed information about a specific test session.

**Parameters:**
- `sessionId` (required): BrowserStack session ID

**Returns:**
- Complete session metadata
- Device: name, OS version, Appium version
- Execution details: status, duration, reason
- Debug URLs: video, logs, network logs

**Example Use:**
```
Get details for session abc456
```

### 4. **get_session_logs**
Fetch full Appium logs for debugging failed tests.

**Parameters:**
- `sessionId` (required): BrowserStack session ID

**Returns:**
- Appium server logs (last 8000 chars)
- Exact error messages
- Selectors that were attempted
- Stack traces for failures

**Example Use:**
```
Show me the logs for failed session abc456
```

### 5. **get_browserstack_plan**
Check BrowserStack account limits and usage.

**Parameters:** None

**Returns:**
- Maximum parallel sessions allowed
- Currently running sessions
- Queue status and limits
- Team parallel session limits

**Example Use:**
```
Check my BrowserStack plan limits
```

## Configuration

### Required Environment Variables

The BrowserStack API tools require these credentials:

```bash
BROWSERSTACK_USERNAME=your_username
BROWSERSTACK_ACCESS_KEY=your_access_key
```

### Claude Desktop Configuration

Add to `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "appiumMCP": {
      "command": "node",
      "args": ["C:\\path\\to\\appium-mcp-server\\src\\server.js"],
      "env": {
        "BROWSERSTACK_USERNAME": "YOUR_USERNAME",
        "BROWSERSTACK_ACCESS_KEY": "YOUR_ACCESS_KEY",
        "BS_APP_REFERENCE": "bs://your_app_hash"
      }
    }
  }
}
```

**Note:** `BS_APP_REFERENCE` is only needed for device control tools, not for BrowserStack API tools.

### VS Code Integration

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "appiumMCP": {
      "type": "stdio",
      "command": "node",
      "args": ["${workspaceFolder}/src/server.js"]
    }
  }
}
```

For VS Code, credentials can be in a `.env` file in the project root:

```bash
BROWSERSTACK_USERNAME=your_username
BROWSERSTACK_ACCESS_KEY=your_access_key
```

## Usage Examples

### Debugging a Failed Test

1. **Get recent builds:**
   ```
   Use get_test_results to show my recent test runs
   ```

2. **Identify failures:**
   Look for `failedSessions` in the output

3. **Get detailed logs:**
   ```
   Use get_session_logs with sessionId "abc123" to see why it failed
   ```

4. **Check session details:**
   ```
   Use get_session_details for session "abc123" to see device info and URLs
   ```

### Monitoring Test Health

1. **Check overall status:**
   ```
   Get my test results from the last 10 builds
   ```

2. **Analyze build history:**
   ```
   Show sessions for build "xyz789"
   ```

3. **Monitor account usage:**
   ```
   Check my BrowserStack plan to see if I'm hitting limits
   ```

### Investigating Intermittent Failures

1. **Get multiple builds:**
   ```
   Get test results for "Search Feature" builds, limit 10
   ```

2. **Compare sessions:**
   Look at passed vs failed sessions for patterns

3. **Check device differences:**
   Use get_session_details to see if failures are device-specific

## Tips & Best Practices

### Efficient Debugging Workflow

1. Start with `get_test_results` to get an overview
2. Use `get_build_sessions` to drill into specific builds
3. Check `get_session_logs` for failed sessions
4. Use the `publicUrl` to watch video recordings

### Understanding Failure Reasons

The BrowserStack API provides failure reasons:
- **"No error"** - Test passed
- **"Element not found"** - Selector issues
- **"Timeout"** - Element took too long to appear
- **"Server error"** - BrowserStack infrastructure issue

Check logs for the exact error and stack trace.

### Account Management

- Run `get_browserstack_plan` regularly to monitor usage
- Check `parallelSessionsRunning` to see current load
- Use `queued` to see if tests are waiting

### Performance Tips

- Use `limit` parameter in get_test_results to reduce API calls
- Cache build IDs if analyzing the same build multiple times
- Public URLs are permanent - save them for later review

## Troubleshooting

### "BrowserStack API not configured" Error

**Cause:** Missing credentials

**Fix:** Ensure `BROWSERSTACK_USERNAME` and `BROWSERSTACK_ACCESS_KEY` are set in your environment or Claude Desktop config.

### "No builds found" Message

**Cause:** No test runs on BrowserStack yet

**Fix:** Run at least one test via `npx wdio wdio.conf.js` first.

### Empty Session Lists

**Cause:** Build ID is incorrect or build has no sessions

**Fix:** Use `get_test_results` to get valid build IDs.

### Truncated Logs

**Why:** Appium logs can be very large (100KB+)

**Info:** Logs are truncated to last 8000 characters to focus on recent errors. Download full logs from the public URL if needed.

## API Rate Limits

BrowserStack API has rate limits:
- **Default:** 100 requests per minute
- **Concurrent:** 5 simultaneous connections

The MCP tools handle this by:
- Using efficient queries
- Reusing API instances
- Providing reasonable default limits

## Security

### Credentials Storage

✅ **Secure:**
- Environment variables in Claude Desktop config
- `.env` file in VS Code (gitignored)

❌ **Insecure:**
- Hardcoded in source files
- Committed to version control

### Best Practices

1. Never commit `.env` files
2. Use different credentials for CI/CD
3. Rotate access keys regularly
4. Limit access to production accounts

## Support

For issues:
1. Check that credentials are correct
2. Verify network connectivity to api.browserstack.com
3. Test API access: `node src/server.js --help`
4. Check BrowserStack dashboard for test runs

## Version History

- **v0.3.0** - Initial BrowserStack API MCP integration
  - Added 5 BrowserStack API tools
  - Refactored to use BrowserStackAPI class
  - Comprehensive error handling

---

**Built for efficient test debugging and monitoring! 🚀**
