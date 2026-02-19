class WikipediaSearchPage {
  constructor(browser) {
    this.browser = browser;
  }

  // Element selectors based on MCP discovery
  get searchBar() {
    return this.browser.$('id=org.wikipedia.alpha:id/search_bar');
  }

  get searchInput() {
    return this.browser.$('id=org.wikipedia.alpha:id/search_src_text');
  }

  get searchCloseButton() {
    return this.browser.$('id=org.wikipedia.alpha:id/search_close_btn');
  }

  get searchToolbar() {
    return this.browser.$('id=org.wikipedia.alpha:id/search_toolbar');
  }

  get recentSearchesSection() {
    return this.browser.$('//*[contains(@text, "Recent searches")]');
  }

  get languageSelector() {
    return this.browser.$('//*[contains(@text, "Wikipedia language")]');
  }

  // Actions
  async isOnSearchPage() {
    await this.searchBar.waitForDisplayed({ timeout: 10000 });
    return await this.searchBar.isDisplayed();
  }

  async enterSearchTerm(searchTerm) {
    await this.searchInput.waitForDisplayed({ timeout: 10000 });
    await this.searchInput.click();
    await this.browser.pause(500);
    await this.searchInput.setValue(searchTerm);
    await this.browser.pause(1000);
  }

  async closeSearch() {
    await this.searchCloseButton.waitForDisplayed({ timeout: 10000 });
    await this.searchCloseButton.click();
    await this.browser.pause(1000);
  }

  async tapSearchResult(resultText) {
    const result = await this.browser.$(`//*[contains(@text, "${resultText}")]`);
    await result.waitForDisplayed({ timeout: 10000 });
    await result.click();
    await this.browser.pause(2000);
  }

  async verifySearchViewOpened() {
    return await this.isOnSearchPage();
  }

  async verifyRecentSearchesVisible() {
    try {
      await this.recentSearchesSection.waitForDisplayed({ timeout: 5000 });
      return await this.recentSearchesSection.isDisplayed();
    } catch (e) {
      return false;
    }
  }
}

module.exports = { WikipediaSearchPage };
