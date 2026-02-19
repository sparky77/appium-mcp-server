/**
 * MCP Screen Inspector - Wikipedia App
 *
 * Uses MCP components to analyze the first screen of Wikipedia app
 */

const { AppiumSession } = require('../src/appium/session.js');
const { ScreenAnalyzer } = require('../src/analysis/screen.js');

async function inspectWikipediaHome() {
  const session = new AppiumSession();
  const analyzer = new ScreenAnalyzer();

  try {
    console.log('🚀 Connecting to BrowserStack...');
    const driver = await session.getDriver();
    console.log('✅ Connected! Session started\n');

    // Wait for app to load
    console.log('⏳ Waiting for app to load...');
    await driver.pause(5000);

    console.log('🔍 Analyzing Wikipedia home screen...\n');
    const analysis = await analyzer.analyze(driver);

    // Parse and display results
    const screenData = JSON.parse(analysis.content[0].text);

    console.log('='.repeat(80));
    console.log('📱 WIKIPEDIA HOME SCREEN ANALYSIS');
    console.log('='.repeat(80));

    console.log('\n📍 CONTEXT INFORMATION:');
    console.log(`   Current Context: ${screenData.context}`);
    console.log(`   Available Contexts: ${screenData.available_contexts.join(', ')}`);
    console.log(`   Page Detected: ${screenData.current_page}`);

    console.log('\n🎯 CLICKABLE ELEMENTS: ' + screenData.clickable_count);

    console.log('\n📋 ELEMENTS FOUND:');
    screenData.elements.forEach((elem, index) => {
      if (elem.text || elem.resourceId || elem.contentDesc) {
        console.log(`\n   [${index + 1}] Element:`);
        if (elem.text) console.log(`       Text: "${elem.text}"`);
        if (elem.resourceId) console.log(`       Resource ID: ${elem.resourceId}`);
        if (elem.contentDesc) console.log(`       Content Desc: ${elem.contentDesc}`);
        console.log(`       Clickable: ${elem.isClickable ? '✅' : '❌'}`);
      }
    });

    if (screenData.suggestions && screenData.suggestions.length > 0) {
      console.log('\n💡 SUGGESTIONS:');
      screenData.suggestions.forEach(s => console.log(`   • ${s}`));
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Analysis complete!\n');

    // Save raw data for reference
    const fs = require('fs');
    const path = require('path');
    const outputPath = path.join(__dirname, '..', 'screen-analysis.json');
    fs.writeFileSync(outputPath, JSON.stringify(screenData, null, 2));
    console.log('📄 Full analysis saved to: screen-analysis.json (in project root)\n');

    // Wait a moment before cleanup
    await driver.pause(3000);

  } catch (error) {
    console.error('\n❌ Error during analysis:');
    console.error(error.message);
    console.error('\nFull error:', error);
  } finally {
    console.log('🧹 Cleaning up session...');
    await session.cleanup();
    console.log('✅ Done!\n');
  }
}

inspectWikipediaHome();
