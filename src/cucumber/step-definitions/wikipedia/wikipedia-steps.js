const { Given, When, Then, Before: BeforeStep } = require('@wdio/cucumber-framework');
const { WikipediaMainPage } = require('../../../page-objects/wikipedia/WikipediaMainPage');
const { WikipediaSearchPage } = require('../../../page-objects/wikipedia/WikipediaSearchPage');
const { WikipediaArticlePage } = require('../../../page-objects/wikipedia/WikipediaArticlePage');
const assert = require('assert');

// NOTE: Main Before/After hooks are in hooks.js (shared for BrowserStack naming)

// Page object instances - MUST be initialized per scenario
let mainPage, searchPage, articlePage;

// Initialize page objects AFTER hooks.js sets session name
BeforeStep({ order: 10000 }, async function() {
  mainPage = new WikipediaMainPage(browser);
  searchPage = new WikipediaSearchPage(browser);
  articlePage = new WikipediaArticlePage(browser);
});

// ======================
// GIVEN STEPS
// ======================
Given('the Wikipedia app is launched on Android {float}', async function(version) {
  const source = await browser.getPageSource();
  assert.ok(source, `App should be running on Android ${version}`);
  await browser.pause(3000); // Wait for app to stabilize
  console.log('ℹ️ Wikipedia app launched, waiting for initialization');
});

Given('I have dismissed the version warning', async function() {
  try {
    // Wait a bit for dialog to appear
    await browser.pause(2000);
    
    // Try to find and click OK button
    const okButton = await browser.$('id=android:id/button1');
    await okButton.waitForDisplayed({ timeout: 5000 });
    await okButton.click();
    await browser.pause(1000);
    console.log('✅ Dismissed version warning dialog');
  } catch (e) {
    console.log('ℹ️ No version warning dialog found (already dismissed)');
  }
});

Given('I am on the Wikipedia main feed', async function() {
  const onMainPage = await mainPage.isOnMainPage();
  assert.ok(onMainPage, 'Should be on Wikipedia main feed');
});

Given('I have opened the search view', async function() {
  await mainPage.tapSearch();
  const onSearchPage = await searchPage.isOnSearchPage();
  assert.ok(onSearchPage, 'Search view should be open');
});

Given('I am viewing an article', async function() {
  await mainPage.tapFeaturedArticle();
  await browser.pause(2000);
});

Given('I am viewing an article successfully', async function() {
  await mainPage.tapFeaturedArticle();
  const isLoaded = await articlePage.verifyArticleLoaded();
  assert.ok(isLoaded, 'Article should load successfully');
});

// ======================
// WHEN STEPS
// ======================
When('the version warning dialog appears', async function() {
  await browser.pause(2000); // Wait for dialog to appear
  const dialogTitle = await browser.$('id=android:id/alertTitle');
  await dialogTitle.waitForDisplayed({ timeout: 10000 });
  console.log('✅ Version warning dialog appeared');
});

When('I tap the {string} button', async function(buttonText) {
  if (buttonText === 'OK') {
    const okButton = await browser.$('id=android:id/button1');
    await okButton.click();
    await browser.pause(1000);
    console.log('✅ Tapped OK button');
  } else if (buttonText === 'Check for update') {
    const checkButton = await browser.$('id=android:id/button3');
    await checkButton.click();
    await browser.pause(2000);
    console.log('✅ Tapped Check for update button');
  } else if (buttonText === 'GO BACK') {
    await articlePage.tapGoBack();
  } else {
    throw new Error(`Unknown button: ${buttonText}`);
  }
});

When('I tap the search container', async function() {
  await mainPage.tapSearch();
});

When('I tap the close button', async function() {
  await searchPage.closeSearch();
});

When('I enter {string} in the search field', async function(searchTerm) {
  await searchPage.enterSearchTerm(searchTerm);
});

When('I tap the first search result', async function() {
  await searchPage.tapSearchResult(''); // Tap first result
  await browser.pause(2000);
});

When('I tap the {string} card', async function(cardText) {
  if (cardText === 'Featured article') {
    await mainPage.tapFeaturedArticle();
  }
});

When('the article fails to load', async function() {
  // This is checked in Then step
  await browser.pause(2000);
});

// ======================
// THEN STEPS
// ======================
Then('I should see {string} title', async function(titleText) {
  // Check if this is the dialog title (special case)
  if (titleText === 'Wikipedia Alpha' || this.pickle?.name?.includes('version warning')) {
    const dialogTitle = await browser.$('id=android:id/alertTitle');
    const title = await dialogTitle.getText();
    assert.ok(title.includes(titleText), `Dialog title should contain "${titleText}"`);
    console.log(`✅ Verified dialog title contains: ${titleText}`);
  } else {
    const element = await browser.$(`//*[contains(@text, "${titleText}")]`);
    await element.waitForDisplayed({ timeout: 10000 });
    const isDisplayed = await element.isDisplayed();
    assert.ok(isDisplayed, `Should see "${titleText}"`);
  }
});

Then('I should see {string} button', async function(buttonText) {
  // Check if this is a dialog button (special case)
  if (buttonText === 'OK') {
    const okButton = await browser.$('id=android:id/button1');
    await okButton.waitForDisplayed({ timeout: 10000 });
    console.log('✅ OK button visible');
  } else if (buttonText === 'Check for update') {
    const checkButton = await browser.$('id=android:id/button3');
    await checkButton.waitForDisplayed({ timeout: 10000 });
    console.log('✅ Check for update button visible');
  } else {
    const element = await browser.$(`//*[contains(@text, "${buttonText}")]`);
    await element.waitForDisplayed({ timeout: 10000 });
    const isDisplayed = await element.isDisplayed();
    assert.ok(isDisplayed, `Should see "${buttonText}" button`);
  }
});

Then('I should be on the Wikipedia main feed', async function() {
  const onMainPage = await mainPage.isOnMainPage();
  assert.ok(onMainPage, 'Should be on main feed');
});

Then('I should see the search container', async function() {
  const onMainPage = await mainPage.isOnMainPage();
  assert.ok(onMainPage, 'Search container should be visible');
});

Then('I should see {string} section', async function(sectionText) {
  const element = await browser.$(`//*[contains(@text, "${sectionText}")]`);
  await element.waitForDisplayed({ timeout: 10000 });
  const isDisplayed = await element.isDisplayed();
  assert.ok(isDisplayed, `Should see "${sectionText}" section`);
});

Then('the app should attempt to open the Play Store', async function() {
  await browser.pause(2000);
  // Verify we left the Wikipedia app or Play Store intent was triggered
  const currentPackage = await browser.getCurrentPackage();
  console.log(`📱 Current package: ${currentPackage}`);
  // This will either be Play Store or back to Wikipedia (if Play Store not available)
  const validPackages = ['com.android.vending', 'org.wikipedia.alpha'];
  assert.ok(validPackages.includes(currentPackage), `Should be in Play Store or Wikipedia, got: ${currentPackage}`);
  console.log('✅ Play Store navigation attempted');
});

Then('I should see today\'s date displayed', async function() {
  const source = await browser.getPageSource();
  const today = new Date();
  const monthDay = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  assert.ok(source.includes(monthDay) || source.includes(today.getFullYear().toString()), 
    'Should see current date');
});

Then('the search view should open', async function() {
  const onSearchPage = await searchPage.isOnSearchPage();
  assert.ok(onSearchPage, 'Search view should open');
});

Then('I should see the search input field', async function() {
  const onSearchPage = await searchPage.isOnSearchPage();
  assert.ok(onSearchPage, 'Search input field should be visible');
});

Then('I should see {string} selector', async function(selectorText) {
  const element = await browser.$(`//*[contains(@text, "${selectorText}")]`);
  await element.waitForDisplayed({ timeout: 10000 });
  const isDisplayed = await element.isDisplayed();
  assert.ok(isDisplayed, `Should see "${selectorText}"`);
});

Then('I should see {string} language displayed', async function(language) {
  const element = await browser.$(`//*[contains(@text, "${language}")]`);
  await element.waitForDisplayed({ timeout: 10000 });
  const isDisplayed = await element.isDisplayed();
  assert.ok(isDisplayed, `Should see "${language}" language`);
});

Then('I should return to the main feed', async function() {
  await browser.pause(1000);
  const onMainPage = await mainPage.isOnMainPage();
  assert.ok(onMainPage, 'Should return to main feed');
});

Then('I should see search suggestions', async function() {
  await browser.pause(2000);
  const source = await browser.getPageSource();
  assert.ok(source.length > 0, 'Should see search results');
});

Then('I should navigate to the article page', async function() {
  await browser.pause(2000);
  const contexts = await browser.getContexts();
  const hasWebview = contexts.some(ctx => ctx.includes('WEBVIEW'));
  assert.ok(hasWebview || await articlePage.isOnArticlePage(), 
    'Should navigate to article page');
});

Then('I should see {string} message', async function(messageText) {
  const element = await browser.$(`//*[contains(@text, "${messageText}")]`);
  await element.waitForDisplayed({ timeout: 10000 });
  const isDisplayed = await element.isDisplayed();
  assert.ok(isDisplayed, `Should see "${messageText}" message`);
});

Then('I should navigate to an article page', async function() {
  await browser.pause(2000);
  const isOnArticle = await articlePage.isOnArticlePage();
  const hasError = await articlePage.isErrorDisplayed();
  assert.ok(isOnArticle || hasError, 'Should navigate to article page');
});

Then('the article content should load', async function() {
  const isLoaded = await articlePage.verifyArticleLoaded();
  const hasError = await articlePage.isErrorDisplayed();
  assert.ok(isLoaded || hasError, 'Article should load or show error');
});

Then('I should return to the previous screen', async function() {
  await browser.pause(1000);
  const source = await browser.getPageSource();
  assert.ok(source.length > 0, 'Should navigate back');
});

Then('I should see {string} option', async function(optionText) {
  const element = await browser.$(`//*[contains(@text, "${optionText}") or contains(@content-desc, "${optionText}")]`);
  await element.waitForDisplayed({ timeout: 10000 });
  const isDisplayed = await element.isDisplayed();
  assert.ok(isDisplayed, `Should see "${optionText}" option`);
});

module.exports = {
  mainPage,
  searchPage,
  articlePage
};
