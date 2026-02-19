# 🚀 HOW TO START THE SERVER

## ✅ App Reference Updated!
New Wikipedia Alpha APK: `bs://363cb761bf2fea6658dc6a17b4e0dd7a47a10df1`

---

## Method 1: Via Claude Desktop (Recommended)

This is the **main way** to use your MCP server - Claude Desktop starts it automatically when needed.

### Step 1: Update Claude Desktop Config

1. **Open the config file** (Windows):
   ```powershell
   notepad %APPDATA%\Claude\claude_desktop_config.json
   ```

2. **Add or update** this configuration:
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

3. **Save** and close the file

### Step 2: Restart Claude Desktop

1. **Fully close** Claude Desktop
   - Close all windows
   - Check Task Manager (Ctrl+Shift+Esc) to ensure no Claude processes running

2. **Reopen** Claude Desktop

### Step 3: Verify Connection

Look for:
- 🔌 MCP server icon showing **appiumMCP** connected
- 🛠️ **7 tools available** in the tools list

### Step 4: Start Testing!

In your conversation with Claude, try:
```
"Use inspect_screen to analyze the Wikipedia app"
```

Claude Desktop will automatically:
- Start your MCP server
- Connect to BrowserStack
- Run the tool
- Keep the server running for subsequent commands

---

## Method 2: Standalone Mode (For Testing/Debugging)

If you want to test the server directly without Claude Desktop:

### Quick Test:
```powershell
cd d:\Apps\appium-mcp-server
node src/server.js
```

**Expected output:**
```
Appium MCP server with coverage analysis running
```

This confirms:
- ✅ Node.js is working
- ✅ Dependencies are installed
- ✅ Server starts correctly

**Note:** In standalone mode, the server is running but waiting for stdio input from Claude Desktop. Press `Ctrl+C` to stop it.

---

## Method 3: Run Cucumber Tests Directly

If you want to run the generated Cucumber tests without Claude:

```powershell
cd d:\Apps\appium-mcp-server
npm run test:cucumber
```

This will:
- Connect to BrowserStack
- Run any feature files in `features/` folder
- Generate reports in `reports/` folder

---

## 🔍 Troubleshooting

### "Server not showing in Claude Desktop"
1. Check config file path is correct
2. Verify JSON syntax (no trailing commas)
3. Use double backslashes `\\` in paths
4. Restart Claude Desktop **completely**

### "Cannot find module"
```powershell
cd d:\Apps\appium-mcp-server
npm install
```

### "BrowserStack connection failed"
1. Verify credentials in Claude config or `.env` file
2. Check app reference matches your uploaded APK in BrowserStack App Automate
3. Ensure you have BrowserStack App Automate plan active

### "Node is not recognized"
Install Node.js from: https://nodejs.org/
(Requires v18 or higher)

---

## 📝 What Happens When You Use a Tool in Claude?

```
1. You ask Claude to use a tool
   ↓
2. Claude Desktop starts your MCP server (if not running)
   ↓
3. Your server connects to BrowserStack
   ↓
4. BrowserStack launches Wikipedia APK on device
   ↓
5. Your server executes the tool (inspect_screen, smart_action, etc.)
   ↓
6. Results are sent back to Claude
   ↓
7. Claude shows you the results and suggests next steps
   ↓
8. Server stays running for next command
```

---

## ✅ Recommended First Steps

1. **Update Claude Desktop config** with the new app reference
2. **Restart Claude Desktop**
3. **Verify connection** (look for the MCP server icon)
4. **Try inspect_screen** first - it's the safest test
5. **Explore other tools** once connected

---

**🎯 You're all set! The Wikipedia APK reference is configured.**
