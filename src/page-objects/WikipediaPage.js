/**
 * Wikipedia Sample App Page Object
 *
 * BrowserStack Sample App: bs://sample-wikipedia-app
 * Package: org.wikipedia.alpha
 */

class WikipediaPage {
  constructor(driver) {
    this.driver = driver;
  }

  /**
   * Main Screen Elements
   */
  get searchButton() {
    // The main search button on home screen
    return this.driver.$('~Search Wikipedia');
  }

  get skipButton() {
    // Skip onboarding if present
    return this.driver.$('id=org.wikipedia.alpha:id/fragment_onboarding_skip_button');
  }

  /**
   * Search Elements
   */
  get searchInput() {
    // Search text input field
    return this.driver.$('id=org.wikipedia.alpha:id/search_src_text');
  }

  get searchResults() {
    // Search results container
    return this.driver.$('id=org.wikipedia.alpha:id/search_results_list');
  }

  get firstSearchResult() {
    // First result in search list
    return this.driver.$('id=org.wikipedia.alpha:id/page_list_item_title');
  }

  /**
   * Article Elements
   */
  get articleTitle() {
    return this.driver.$('id=org.wikipedia.alpha:id/view_page_title_text');
  }

  get articleContent() {
    return this.driver.$('id=org.wikipedia.alpha:id/page_web_view');
  }

  /**
   * Actions
   */
  async skipOnboarding() {
    try {
      await this.skipButton.waitForDisplayed({ timeout: 3000 });
      await this.skipButton.click();
      console.log('Skipped onboarding');
    } catch (error) {
      console.log('No onboarding to skip');
    }
  }

  async tapSearch() {
    await this.searchButton.waitForDisplayed({ timeout: 10000 });
    await this.searchButton.click();
  }

  async enterSearchTerm(searchTerm) {
    await this.searchInput.waitForDisplayed({ timeout: 10000 });
    await this.searchInput.setValue(searchTerm);
  }

  async tapFirstResult() {
    await this.firstSearchResult.waitForDisplayed({ timeout: 10000 });
    await this.firstSearchResult.click();
  }

  async search(searchTerm) {
    await this.skipOnboarding();
    await this.tapSearch();
    await this.enterSearchTerm(searchTerm);
    await this.driver.pause(2000); // Wait for results to populate
  }

  /**
   * Verifications
   */
  async isSearchButtonDisplayed() {
    try {
      await this.searchButton.waitForDisplayed({ timeout: 10000 });
      return true;
    } catch (error) {
      return false;
    }
  }

  async areSearchResultsDisplayed() {
    try {
      await this.searchResults.waitForDisplayed({ timeout: 10000 });
      return true;
    } catch (error) {
      return false;
    }
  }

  async isArticleDisplayed() {
    try {
      await this.articleTitle.waitForDisplayed({ timeout: 10000 });
      return true;
    } catch (error) {
      return false;
    }
  }

  async getFirstResultText() {
    await this.firstSearchResult.waitForDisplayed({ timeout: 10000 });
    return await this.firstSearchResult.getText();
  }
}

module.exports = { WikipediaPage };
