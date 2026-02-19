require('dotenv').config();

exports.config = {
  runner: 'local',
  
  specs: ['./features/**/*.feature'],
  
  capabilities: [{
    platformName: 'Android',
    'appium:platformVersion': '15.0',
    'appium:deviceName': 'Samsung Galaxy Tab S10 Plus',
    'appium:app': process.env.BS_APP_REFERENCE,
    'appium:automationName': 'UiAutomator2',
    'bstack:options': {
      userName: process.env.BROWSERSTACK_USERNAME,
      accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
      projectName: 'MCP Generated Tests',
      buildName: 'MCP POC run 1'
      // sessionName set dynamically in Before hook
    }
  }],

  hostname: 'hub-cloud.browserstack.com',
  port: 443,
  protocol: 'https',
  path: '/wd/hub',

  logLevel: 'info',
  bail: 0,
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  framework: 'cucumber',
  
  cucumberOpts: {
    require: ['./src/cucumber/step-definitions/**/*.js'],
    backtrace: false,
    requireModule: [],
    dryRun: false,
    failFast: false,
    snippets: true,
    source: true,
    strict: false,
    // tags set via CLI parameter --cucumberOpts.tags
    timeout: 60000,
    ignoreUndefinedDefinitions: false
  },

  reporters: [
    'spec',
    ['junit', {
      outputDir: './reports',
      outputFileFormat: function(options) {
        return `results-${options.cid}.xml`;
      }
    }]
  ],

  onPrepare: function (config, capabilities) {
    console.log('Starting WebdriverIO + Cucumber test execution');
  },

  afterTest: function(test, context, { error, result, duration, passed, retries }) {
    if (!passed) {
      browser.takeScreenshot();
    }
  }
};