/**
 * BROKEN STEP DEFINITIONS FOR DEMO
 * 
 * These steps contain intentional bugs to demonstrate:
 * - MCP debugging workflow
 * - Real-time element inspection
 * - AI-guided test fixing
 * 
 * BACKUP: Original working steps are in wikipedia-steps.js
 * NOTE: Before/After hooks are in hooks.js (shared across all step files)
 */

const { When, Then } = require('@wdio/cucumber-framework');
const { WikipediaMainPage } = require('../../../page-objects/wikipedia/WikipediaMainPage');
const { WikipediaSearchPage } = require('../../../page-objects/wikipedia/WikipediaSearchPage');
const assert = require('assert');

let mainPage, searchPage;

// Initialize page objects (reuse from main steps)
if (!mainPage) {
  mainPage = new WikipediaMainPage(browser);
  searchPage = new WikipediaSearchPage(browser);
}

// ======================
// BROKEN STEPS FOR DEMO
// ======================

/**
 * BUG #1: Wrong element selector
 */
When('I enter text into wrong search field', async function() {
  // BUG: Using wrong element ID that doesn't exist
  const wrongElement = await browser.$('id=org.wikipedia.alpha:id/wrong_search_input');
  
  try {
    await wrongElement.waitForDisplayed({ timeout: 5000 });
    await wrongElement.click();
    await wrongElement.setValue('Test Query');
  } catch (e) {
    console.log('⚠️ DEMO BUG: Wrong element selector - element not found');
    throw new Error('DEMO BUG: Cannot find search input - selector is wrong!');
  }
});

/**
 * BUG #2: State management - action without prerequisite
 */
When('I tap the close button without opening search first', async function() {
  // BUG: Assumes search is open, but Background doesn't open it
  try {
    await searchPage.closeSearch();
    console.log('⚠️ DEMO BUG: Trying to close search that may not be open');
  } catch (e) {
    console.log('⚠️ DEMO BUG: Close button not found - search view not open');
    throw new Error('DEMO BUG: Cannot close search - view not open!');
  }
});

/**
 * BUG #3: Wrong assertion expectation
 * This passes the correct text but expects wrong outcome
 * (The step definition is correct, but the expectation in feature file is wrong)
 */
// Already handled by main wikipedia-steps.js assertions

module.exports = {};
