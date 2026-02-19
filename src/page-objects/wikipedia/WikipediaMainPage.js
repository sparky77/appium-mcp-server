class WikipediaMainPage {
  constructor(browser) {
    this.browser = browser;
  }

  // Element selectors based on MCP discovery
  get searchContainer() {
    return this.browser.$('id=org.wikipedia.alpha:id/search_container');
  }

  get featuredArticleCard() {
    return this.browser.$('//*[contains(@text, "Featured article")]');
  }

  get mainFeed() {
    return this.browser.$('id=org.wikipedia.alpha:id/fragment_feed_feed');
  }

  get viewPager() {
    return this.browser.$('~org.wikipedia.alpha:id/fragment_main_view_pager');
  }

  // Actions
  async isOnMainPage() {
    try {
      await this.searchContainer.waitForDisplayed({ timeout: 10000 });
      return await this.searchContainer.isDisplayed();
    } catch (e) {
      console.log('⚠️ Search container not found - app may not be on main page');
      console.log('   Attempting to get page source for debugging...');
      try {
        const source = await this.browser.getPageSource();
        console.log('   Current screen contains:', source.substring(0, 500));
      } catch (sourceError) {
        console.log('   Could not get page source');
      }
      return false;
    }
  }

  async tapSearch() {
    await this.searchContainer.waitForDisplayed({ timeout: 10000 });
    await this.searchContainer.click();
    await this.browser.pause(1000);
  }

  async tapFeaturedArticle() {
    await this.featuredArticleCard.waitForDisplayed({ timeout: 10000 });
    await this.featuredArticleCard.click();
    await this.browser.pause(2000);
  }

  async getPageSource() {
    return await this.browser.getPageSource();
  }

  async verifyMainFeedLoaded() {
    await this.mainFeed.waitForDisplayed({ timeout: 10000 });
    const isDisplayed = await this.mainFeed.isDisplayed();
    return isDisplayed;
  }
}

module.exports = { WikipediaMainPage };
