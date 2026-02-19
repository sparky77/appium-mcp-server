const { BrowserStackAPI } = require('./browserstack-api.js');

(async () => {
  try {
    const client = new BrowserStackAPI();
    
    console.log('Fetching builds...');
    const builds = await client.getBuilds();
    
    console.log(`Total builds found: ${builds.length}\n`);
    
    if (builds.length === 0) {
      console.log('❌ No builds found');
      return;
    }
    
    // Show latest build details
    const latestBuild = builds[0].automation_build;
    console.log('LATEST BUILD DETAILS:');
    console.log(JSON.stringify(latestBuild, null, 2));
    console.log('\n' + '='.repeat(80));
    
    console.log('\nFetching sessions...');
    const sessions = await client.getSessions(latestBuild.hashed_id);
    
    console.log(`\nTotal sessions: ${sessions.length}\n`);
    
    sessions.forEach((session, i) => {
      const s = session.automation_session;
      console.log(`${i+1}. "${s.name}" - ${s.status} - ${s.duration}s`);
    });
    
    console.log('\n' + '='.repeat(80));
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error.stack);
  }
})();
