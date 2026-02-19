/**
 * SHARED CUCUMBER HOOKS
 * 
 * These hooks run for ALL scenarios regardless of which step definition file is used.
 * This ensures consistent BrowserStack session naming and status reporting.
 */

const { Before, After, setDefaultTimeout } = require('@wdio/cucumber-framework');
const { WikipediaMainPage } = require('../../../page-objects/wikipedia/WikipediaMainPage');
const { WikipediaSearchPage } = require('../../../page-objects/wikipedia/WikipediaSearchPage');
const { WikipediaArticlePage } = require('../../../page-objects/wikipedia/WikipediaArticlePage');

// Set default timeout for all steps
setDefaultTimeout(60000);

Before(async function(scenario) {
  // Build dynamic session name for BrowserStack
  const scenarioName = scenario.pickle?.name || 'Unknown Scenario';
  const featureName = scenario.gherkinDocument?.feature?.name || 'Unknown Feature';
  const fullSessionName = `App [Wikipedia] [Feature : ${featureName}] [Scenario : ${scenarioName}]`;
  
  console.log(`🎬 Starting scenario: ${scenarioName}`);
  console.log(`📝 BrowserStack session name: ${fullSessionName}`);
  
  try {
    await browser.execute(`browserstack_executor: {"action": "setSessionName", "arguments": {"name": "${fullSessionName}"}}`);
    console.log('✅ Session name set successfully');
  } catch (e) {
    console.log('⚠️ Failed to set session name:', e.message);
  }
  
  // Ensure we're in NATIVE_APP context
  try {
    const context = await browser.getContext();
    if (context !== 'NATIVE_APP') {
      await browser.switchContext('NATIVE_APP');
    }
  } catch (e) {
    console.log('⚠️ Context switch issue:', e.message);
  }
});

After(async function(scenario) {
  const cucumberStatus = scenario.result?.status || 'UNKNOWN';
  const errorMessage = scenario.result?.message || '';
  
  console.log(`📊 Test Status: ${cucumberStatus}`);
  
  if (cucumberStatus === 'PASSED') {
    try {
      await browser.execute(`browserstack_executor: {"action": "setSessionStatus", "arguments": {"status": "passed", "reason": "Test passed successfully"}}`);
      console.log('✅ BrowserStack status set: passed');
    } catch (e) {
      console.log('⚠️ Failed to set passed status:', e.message);
    }
  } else {
    // Any non-passing status (FAILED, AMBIGUOUS, etc.) = failed in BrowserStack
    const errorLower = errorMessage.toLowerCase();
    const scenarioName = scenario.pickle?.name || 'Test Scenario';
    const briefError = errorMessage.substring(0, 80).replace(/\n/g, ' ').replace(/"/g, "'").trim();
    
    let mcpPrompt = '';
    
    if (errorLower.includes('element') && (errorLower.includes('not found') || errorLower.includes('not exist'))) {
      mcpPrompt = `${scenarioName} FAILED - Locator not found: ${briefError}. FIX: Use inspect_screen to analyze UI and get correct selector.`;
    } else if (errorLower.includes('not clickable') || errorLower.includes('not displayed') || errorLower.includes('not visible')) {
      mcpPrompt = `${scenarioName} FAILED - Element not interactable: ${briefError}. FIX: Use smart_action AI handles timing and state.`;
    } else if (errorLower.includes('timeout') || errorLower.includes('wait')) {
      mcpPrompt = `${scenarioName} FAILED - Timeout: ${briefError}. FIX: Use smart_action with AI wait handling.`;
    } else if (errorLower.includes('assertion') || errorLower.includes('expected')) {
      mcpPrompt = `${scenarioName} FAILED - Assertion mismatch: ${briefError}. FIX: Use inspect_screen to verify state update assertion.`;
    } else if (errorLower.includes('undefined') || errorLower.includes('ambiguous')) {
      mcpPrompt = `${scenarioName} FAILED - Missing step: ${briefError}. FIX: Use inspect_screen plus smart_action for AI debugging.`;
    } else if (errorLower.includes('network') || errorLower.includes('connection')) {
      mcpPrompt = `${scenarioName} FAILED - Connection issue: ${briefError}. FIX: Use inspect_screen to verify app state.`;
    } else {
      mcpPrompt = `${scenarioName} FAILED - ${briefError}. FIX: Use inspect_screen plus smart_action for AI debugging.`;
    }
    
    // Format as copy-paste ready prompt (ASCII only, max 240 chars)
    const cleanReason = mcpPrompt.replace(/[^\x20-\x7E]/g, '').replace(/\\/g, '/').substring(0, 240);
    
    try {
      await browser.execute(`browserstack_executor: {"action": "setSessionStatus", "arguments": {"status": "failed", "reason": "${cleanReason}"}}`);
      console.log(`✅ BrowserStack status set: failed (${cucumberStatus})`);
      console.log(`📋 Copy-paste MCP Prompt: ${mcpPrompt}`);
    } catch (e) {
      console.log('⚠️ Failed to set failed status:', e.message);
    }
    
    // Take screenshot for failed tests
    try {
      const screenshot = await browser.takeScreenshot();
      this.attach(screenshot, 'image/png');
      console.log('📸 Screenshot captured for failed test');
    } catch (e) {
      console.log('⚠️ Failed to capture screenshot:', e.message);
    }
  }
  
  // ✅ TRUE SESSION ISOLATION: Use reloadSession() for each scenario
  try {
    console.log('🔄 Creating new session for next scenario...');
    await browser.reloadSession();
    
    // CRITICAL: Wait for new session to initialize
    await browser.pause(5000);
    
    // Dismiss version warning if it appears in new session
    try {
      const versionWarning = await browser.$('id=android:id/button1');
      if (await versionWarning.isDisplayed()) {
        await versionWarning.click();
        console.log('✅ Dismissed version warning in new session');
      } else {
        console.log('ℹ️ No version warning dialog found (already dismissed)');
      }
    } catch (e) {
      console.log('ℹ️ No version warning in new session');
    }
    
    console.log('✅ New session created and initialized');
  } catch (e) {
    console.log('⚠️ Session reload issue:', e.message);
  }
});

module.exports = { Before, After };
