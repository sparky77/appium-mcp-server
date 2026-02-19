class WikipediaArticlePage {
  constructor(browser) {
    this.browser = browser;
  }

  // Element selectors based on MCP discovery
  get pageContainer() {
    return this.browser.$('id=org.wikipedia.alpha:id/page_contents_container');
  }

  get pageError() {
    return this.browser.$('~org.wikipedia.alpha:id/page_error');
  }

  get errorMessage() {
    return this.browser.$('~org.wikipedia.alpha:id/view_wiki_error_text');
  }

  get goBackButton() {
    return this.browser.$('//*[contains(@text, "GO BACK")]');
  }

  get addToReadingListButton() {
    return this.browser.$('//*[contains(@content-desc, "Add this article to a reading list")]');
  }

  get shareButton() {
    return this.browser.$('//*[contains(@content-desc, "Share the article link")]');
  }

  get webView() {
    return this.browser.$('~WEBVIEW_org.wikipedia.alpha');
  }

  // Actions
  async isOnArticlePage() {
    try {
      await this.pageContainer.waitForDisplayed({ timeout: 10000 });
      return await this.pageContainer.isDisplayed();
    } catch (e) {
      return false;
    }
  }

  async isErrorDisplayed() {
    try {
      await this.pageError.waitForDisplayed({ timeout: 5000 });
      return await this.pageError.isDisplayed();
    } catch (e) {
      return false;
    }
  }

  async getErrorText() {
    if (await this.isErrorDisplayed()) {
      return await this.errorMessage.getText();
    }
    return null;
  }

  async tapGoBack() {
    await this.goBackButton.waitForDisplayed({ timeout: 10000 });
    await this.goBackButton.click();
    await this.browser.pause(1000);
  }

  async switchToWebView() {
    const contexts = await this.browser.getContexts();
    const webviewContext = contexts.find(ctx => ctx.includes('WEBVIEW'));
    if (webviewContext) {
      await this.browser.switchContext(webviewContext);
      await this.browser.pause(1000);
    }
  }

  async switchToNativeApp() {
    await this.browser.switchContext('NATIVE_APP');
    await this.browser.pause(500);
  }

  async verifyArticleLoaded() {
    const isLoaded = await this.isOnArticlePage();
    const hasError = await this.isErrorDisplayed();
    return isLoaded && !hasError;
  }
}

module.exports = { WikipediaArticlePage };
