const { remote } = require('webdriverio');

class AppiumSession {
  constructor() {
    this.driver = null;
  }

  async getDriver() {
    if (!this.driver) {
      await this.createSession();
      return this.driver;
    }

    // Ensure existing session is still alive
    try {
      await this.driver.getSession();
    } catch (e) {
      await this.cleanup();
      await this.createSession();
    }

    return this.driver;
  }

  async createSession() {
    this.driver = await remote({
      hostname: 'hub-cloud.browserstack.com',
      port: 443,
      protocol: 'https', 
      path: '/wd/hub',
      connectionRetryTimeout: 180000,  // 3 minutes
      connectionRetryCount: 3,
      capabilities: {
        platformName: 'Android',
        'appium:platformVersion': '12.0',
        'appium:deviceName': 'Samsung Galaxy S21',
        'appium:app': process.env.BS_APP_REFERENCE || 'bs://363cb761bf2fea6658dc6a17b4e0dd7a47a10df1',
        'appium:automationName': 'UiAutomator2',
        'bstack:options': {
          userName: process.env.BROWSERSTACK_USERNAME,
          accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
          projectName: 'MCP Testing',
          buildName: 'MCP POC run',
          sessionName: 'MCP Live Session',
          debug: true,
          networkLogs: true,
          interactiveDebugging: true
        }
      }
    });
    
    // Wait for session to be ready
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        await this.driver.getWindowSize();
        break;
      } catch (e) {
        await this.driver.pause(2000);
      }
    }

    // Switch to NATIVE_APP context for Android UI automation
    await this.driver.pause(4000); // Wait for app to load
    let contexts = [];
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        contexts = await this.driver.getContexts();
        break;
      } catch (e) {
        await this.driver.pause(2000);
      }
    }
    if (contexts.includes('NATIVE_APP')) {
      await this.driver.switchContext('NATIVE_APP');
    }
  }

  async cleanup() {
    if (this.driver) {
      try {
        await this.driver.deleteSession();
      } catch (e) {
        // Ignore cleanup failures (stale/closed sessions)
      }
      this.driver = null;
    }
  }
}

module.exports = { AppiumSession };