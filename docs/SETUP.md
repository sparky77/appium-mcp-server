# MCP Server Setup - Quick Reference

## What is This?

This is a **CUSTOM MCP SERVER** you built yourself. It's not a plugin - it's a standalone Node.js application that Claude Desktop connects to.

## Setup Checklist

- [ ] **Step 1**: Install Node.js dependencies
  ```bash
  cd d:\Apps\appium-mcp-server
  npm install
  ```

- [ ] **Step 2**: Open Claude Desktop config file
  ```
  Location: %APPDATA%\Claude\claude_desktop_config.json
  Full path: C:\Users\YourUsername\AppData\Roaming\Claude\claude_desktop_config.json
  ```

- [ ] **Step 3**: Copy config from `claude_desktop_config.example.json`
  - Or manually add the configuration shown in README.md
  - Make sure to use double backslashes `\\` in Windows paths

- [ ] **Step 4**: Restart Claude Desktop COMPLETELY
  - Close all windows
  - Check Task Manager to ensure it's fully closed
  - Reopen Claude Desktop

- [ ] **Step 5**: Verify connection
  - Look for "appium-mcp" in MCP servers list
  - Should show 7 tools available

## How It Works

```
YOU ARE HERE                    YOUR MCP SERVER              BROWSERSTACK CLOUD
┌─────────────┐                ┌─────────────┐              ┌─────────────┐
│   Claude    │ ◄─── stdio ──► │  server.js  │ ◄─── HTTPS ──►│  Android    │
│  Desktop    │                │             │              │   Device    │
└─────────────┘                └─────────────┘              └─────────────┘
     │                               │                             │
     │                               │                             │
     └── Reads config ───┐           └── Tools:                    └── Test App
         at startup       │               - inspect_screen              (APK)
                          │               - smart_action
                          │               - handle_firebase_auth
                          │               - gesture
                          ▼               - finalize_page
                                         - analyze_gaps
         claude_desktop_config.json      - generate_cucumber
```

## The Two Configs

### 1. Server-Side Config (This Project)
- **Location**: `d:\Apps\appium-mcp-server\.env`
- **Purpose**: BrowserStack credentials for when you run tests directly
- **Optional**: Only needed for standalone Cucumber test runs

### 2. Client-Side Config (Claude Desktop)
- **Location**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Purpose**: Tells Claude Desktop how to start your MCP server
- **Required**: Must have this for Claude to connect to your server

## Testing the Connection

### Test 1: Server Starts
```bash
node src/server.js
```
Expected output: `Appium MCP server with coverage analysis running`

### Test 2: Claude Sees It
After restart, Claude Desktop should show:
- MCP Server: ✅ appium-mcp
- Tools: 7 available

### Test 3: Use a Tool
In Claude, ask:
```
"Use the inspect_screen tool to analyze the current app screen"
```

## Common Issues

### Issue: Server not showing in Claude
- ✅ Check config file path is correct
- ✅ Verify JSON syntax is valid (no trailing commas)
- ✅ Use double backslashes in paths: `d:\\Apps\\...`
- ✅ Restart Claude Desktop completely

### Issue: Connection error
- ✅ Check Node.js is installed: `node --version`
- ✅ Check dependencies installed: `npm install`
- ✅ Check server path in config matches actual location

### Issue: BrowserStack connection fails
- ✅ Verify credentials in config
- ✅ Check app is uploaded to BrowserStack
- ✅ Update BS_APP_REFERENCE if needed

## Your Server Exposes 7 Tools

1. **inspect_screen** - Analyze current screen
2. **handle_firebase_auth** - Auto Firebase login
3. **smart_action** - Natural language commands
4. **gesture** - Tap, swipe, scroll, long-press
5. **finalize_page** - Generate coverage report
6. **analyze_gaps** - Find untested areas
7. **generate_cucumber** - Auto-create test files

## Next Steps

Once connected, you can:
1. Test mobile applications on real Android devices
2. Get AI-powered element analysis
3. Track test coverage automatically
4. Generate Cucumber tests from your exploration
5. Identify testing gaps and risks

**You built a powerful testing assistant! 🚀**
