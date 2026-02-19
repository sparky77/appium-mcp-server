/**
 * Example Standalone Test Script
 *
 * This demonstrates how to run a direct Appium test without MCP
 * Useful for debugging or quick validation
 */

const { AppiumSession } = require('../src/appium/session.js');
const { ExamplePage } = require('../src/page-objects/ExamplePage.js');

async function runTest() {
  const session = new AppiumSession();

  try {
    console.log('🚀 Starting Appium session...');
    const driver = await session.getDriver();

    console.log('📱 Initializing page object...');
    const examplePage = new ExamplePage(driver);

    console.log('🔐 Executing login flow...');
    await examplePage.login('testuser', 'testpass');

    console.log('✅ Test completed successfully!');

    // Wait to observe result
    await driver.pause(3000);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    console.log('🧹 Cleaning up session...');
    await session.cleanup();
  }
}

// Run the test
runTest();
