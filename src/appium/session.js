const { remote } = require('webdriverio');

class AppiumSession {
  constructor() {
    this.driver = null;
  }

  async getDriver() {
    if (!this.driver) {
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
            buildName: 'Build 1.0',
            sessionName: 'MCP Session'
          }
        }
      });
    }
    return this.driver;
  }

  async cleanup() {
    if (this.driver) {
      await this.driver.deleteSession();
      this.driver = null;
    }
  }
}

module.exports = { AppiumSession };