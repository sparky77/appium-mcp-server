/**
 * Example Page Object - Template for creating new page objects
 *
 * Page Object Model (POM) encapsulates page-specific selectors and actions.
 * Each page should have its own class with methods for user interactions.
 */

class ExamplePage {
  constructor(driver) {
    this.driver = driver;
  }

  /**
   * Selectors - Define all element locators here
   * Use accessibility IDs, resource IDs, or xpath
   */
  get usernameField() {
    return this.driver.$('~username'); // Accessibility ID
  }

  get passwordField() {
    return this.driver.$('android=new UiSelector().resourceId("com.app:id/password")');
  }

  get loginButton() {
    return this.driver.$('~login-button');
  }

  get errorMessage() {
    return this.driver.$('~error-message');
  }

  /**
   * Actions - Define user interactions as methods
   */
  async enterUsername(username) {
    await this.usernameField.waitForDisplayed({ timeout: 10000 });
    await this.usernameField.setValue(username);
  }

  async enterPassword(password) {
    await this.passwordField.waitForDisplayed({ timeout: 10000 });
    await this.passwordField.setValue(password);
  }

  async clickLogin() {
    await this.loginButton.waitForClickable({ timeout: 10000 });
    await this.loginButton.click();
  }

  async login(username, password) {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLogin();
  }

  /**
   * Verifications - Methods to check page state
   */
  async isErrorDisplayed() {
    return await this.errorMessage.isDisplayed();
  }

  async getErrorText() {
    return await this.errorMessage.getText();
  }

  /**
   * Context Switching - For hybrid apps with webviews
   */
  async switchToWebview() {
    const contexts = await this.driver.getContexts();
    const webviewContext = contexts.find(ctx => ctx.includes('WEBVIEW'));
    if (webviewContext) {
      await this.driver.switchContext(webviewContext);
    }
  }

  async switchToNative() {
    await this.driver.switchContext('NATIVE_APP');
  }
}

module.exports = { ExamplePage };
