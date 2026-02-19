# Quick Start Checklist - New APK Integration

**Framework Status:** ✅ Ready
**Time to First Test:** ~2 hours

---

## ✅ Pre-Integration Checklist

- [x] Framework Structure and skeleton frame
- [x] Example templates created
- [x] Documentation skeletoned
- [x] CI/CD pipeline configured
- [x] Allure reports integrated
- [x] Sprint plan created

---

## 🚀 Sprint 0: Get Your First Test Running

### Step 1: Upload APK (15 min)

```bash
# Upload your APK to BrowserStack
curl -u "YOUR_USERNAME:YOUR_ACCESS_KEY" \
  -X POST "https://api-cloud.browserstack.com/app-automate/upload" \
  -F "file=@/path/to/your/app.apk"

# Response will include:
# "app_url": "bs://abc123..."
```

**Update `.env`:**
```bash
BROWSERSTACK_USERNAME=your_username
BROWSERSTACK_ACCESS_KEY=your_access_key
BS_APP_REFERENCE=bs://your_app_id_from_above
```

**Update `wdio.conf.js` (line 12):**
```javascript
'appium:app': process.env.BS_APP_REFERENCE || 'bs://your_app_id',
```

---

### Step 2: Install Dependencies (5 min)

```bash
npm install
```

---

### Step 3: Start MCP Server & Inspect First Screen (30 min)

**Start server:**
```bash
node src/server.js
```

**In VS Code with GitHub Copilot:**
```
You: "Use inspect_screen to analyze the current screen"

AI will call the MCP tool and show you all elements
```

**Take notes:**
- Screen name
- Key elements (buttons, inputs, labels)
- Element selectors (accessibility IDs, resource IDs)
- Available contexts (NATIVE_APP, WEBVIEW_*)

**Update files:**
1. Add screen to `mcp-nav/app-map.md`
2. Note important selectors

---

### Step 4: Create First Page Object (30 min)

**Copy template:**
```bash
cp src/page-objects/ExamplePage.js src/page-objects/YourFirstPage.js
```

**Edit `YourFirstPage.js`:**
1. Rename class
2. Replace selectors with real ones from inspect_screen
3. Add methods for key actions
4. Test with simple script

**Example:**
```javascript
class LoginPage {
  constructor(driver) {
    this.driver = driver;
  }

  get usernameField() {
    return this.driver.$('~username-field'); // From inspect_screen
  }

  async enterUsername(username) {
    await this.usernameField.setValue(username);
  }
}
```

---

### Step 5: Write First Feature File (20 min)

**Copy template:**
```bash
cp features/examples/example-login.feature features/your-first-test.feature
```

**Edit feature:**
```gherkin
Feature: First Smoke Test
  Scenario: App launches successfully
    Given the app is launched
    Then I should see the main screen
```

Keep it simple! Just verify app launches.

---

### Step 6: Implement Step Definitions (20 min)

**Edit `src/cucumber/step-definitions/example-steps.js`:**

```javascript
Given('the app is launched', async function () {
  // Driver already available from hooks
  console.log('App launched');
});

Then('I should see the main screen', async function () {
  const mainElement = await this.driver.$('~main-screen-id');
  await expect(mainElement).toBeDisplayed();
});
```

---

### Step 7: Run Your First Test! (10 min)

```bash
npm run test:cucumber -- --spec=features/your-first-test.feature
```

**Expected:**
- Test should launch app on BrowserStack
- Execute your scenario
- Generate report in `reports/`

**If it fails:**
1. Check BrowserStack credentials
2. Verify app_url is correct
3. Check element selectors
4. Review logs for errors

---

### Step 8: Generate Report (5 min)

```bash
npm run test:report
```

Allure report opens in browser showing:
- Test execution timeline
- Pass/fail status
- Screenshots (if any)
- Error details

---

## 🎯 Success Criteria - Sprint 0 Complete

- ✅ APK uploaded to BrowserStack
- ✅ First screen mapped in app-map.md
- ✅ First page object created
- ✅ First feature file written
- ✅ First test passes
- ✅ Allure report generated
- ✅ CI/CD pipeline runs (even if tests fail)

---

## 📚 What to Update After Sprint 0

### Documentation Updates

1. **mcp-nav/app-map.md**
   - Add your first screen
   - Document elements and selectors
   - Add screenshots if helpful

2. **mcp-nav/test-registry.md**
   - Add your first feature file
   - List scenarios
   - Track step coverage

3. **TEST-COVERAGE-SUMMARY.md**
   - Update with first metrics
   - Add screens analyzed
   - Note coverage percentage

4. **mcp-nav/project-context.md**
   - Update app name and package
   - Update BrowserStack app ID
   - Update device/platform info

5. **mcp-nav/handover-prompt.md**
   - Update with your app details
   - Update current status
   - Add app-specific notes

---

## 🔄 Sprint 1 Preview

Once Sprint 0 is done, move to Sprint 1:

1. Map 3-5 core screens
2. Create page objects for each
3. Write 5-10 smoke test scenarios
4. Test critical user flow end-to-end
5. Achieve 20% coverage

See [PROJECT-FLIGHT-PATH.md](PROJECT-FLIGHT-PATH.md) for full sprint plan.

---

## 🆘 Need Help?

**Common Issues:**

1. **"Element not found"**
   - Use `inspect_screen` again
   - Check context (NATIVE_APP vs WEBVIEW)
   - Try different selector strategies

2. **"Session creation failed"**
   - Verify BrowserStack credentials
   - Check app_url is valid
   - Ensure account has App Automate access

3. **"Step undefined"**
   - Check step definition file is in `src/cucumber/step-definitions/`
   - Verify pattern matches exactly
   - Check hooks.js is loading

**Resources:**
- [README.md](README.md) - Full documentation
- [docs/SETUP.md](docs/SETUP.md) - Detailed setup
- [PROJECT-FLIGHT-PATH.md](PROJECT-FLIGHT-PATH.md) - Sprint roadmap

---

**Ready to start?** Upload your APK and begin Step 1! 🚀
