const { BrowserStackAPI } = require('./browserstack-api.js');

(async () => {
  try {
    const client = new BrowserStackAPI();
    
    // Get recent Wikipedia test builds
    const results = await client.getRecentTestResults(5, 'Appium MCP Framework');
    
    if (results.length === 0) {
      console.log('No builds found for "Appium MCP Framework"');
      return;
    }
    
    const latestBuild = results[0].automation_build;
    const sessions = results[0].sessions;
    
    console.log('='.repeat(80));
    console.log(`Latest Wikipedia Build: ${latestBuild.name}`);
    console.log(`Build ID: ${latestBuild.hashed_id}`);
    console.log(`Status: ${latestBuild.status}`);
    console.log(`Total Sessions: ${sessions.length}`);
    console.log('='.repeat(80));
    
    sessions.forEach((session, index) => {
      const s = session.automation_session;
      console.log(`\n${index + 1}. "${s.name}"`);
      console.log(`   Status: ${s.status}`);
      console.log(`   Duration: ${s.duration}s`);
    });
    
    console.log('\n' + '='.repeat(80));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
