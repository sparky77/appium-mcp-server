#!/usr/bin/env node
/**
 * Debug BrowserStack API - Check recent builds
 * Usage: node scripts/debug-browserstack.js
 */

require('dotenv').config();
const { BrowserStackAPI } = require('./browserstack-api');

async function main() {
  try {
    console.log('🔍 Debugging BrowserStack API...\n');
    const api = new BrowserStackAPI();

    console.log('📦 Fetching last 10 builds (any date)...\n');
    const builds = await api.getBuilds(10);

    if (!builds || builds.length === 0) {
      console.log('❌ No builds found in your BrowserStack account');
      console.log('💡 Run some tests first: .\\run-tests.ps1 features/wikipedia/search.feature');
      return;
    }

    // First, show RAW response structure
    console.log('🔍 RAW API RESPONSE (first build):');
    console.log(JSON.stringify(builds[0], null, 2));
    console.log('\n' + '═'.repeat(80) + '\n');

    console.log(`✅ Found ${builds.length} recent builds:\n`);
    console.log('═'.repeat(80));

    builds.forEach((build, index) => {
      const b = build.automation_build;
      
      // Defensive date parsing
      let localDate = 'N/A';
      let isoDate = 'N/A';
      let isToday = 'UNKNOWN';
      
      if (b.created_at) {
        try {
          const createdDate = new Date(b.created_at * 1000);
          localDate = createdDate.toLocaleString();
          isoDate = createdDate.toISOString();
          isToday = isoDate.split('T')[0] === new Date().toISOString().split('T')[0] ? 'YES ✅' : 'NO ❌';
        } catch (e) {
          localDate = `ERROR: ${e.message}`;
          isoDate = `RAW VALUE: ${b.created_at}`;
        }
      } else {
        isoDate = 'NULL/UNDEFINED';
      }

      console.log(`\n📦 Build ${index + 1}:`);
      console.log(`   Name:       ${b.name}`);
      console.log(`   Project:    ${b.project_name || 'N/A'}`);
      console.log(`   Build ID:   ${b.hashed_id}`);
      console.log(`   Status:     ${b.status}`);
      console.log(`   Duration:   ${b.duration}s`);
      console.log(`   Created:    ${localDate}`);
      console.log(`   ISO Date:   ${isoDate}`);
      console.log(`   Today?:     ${isToday}`);
    });

    console.log('\n' + '═'.repeat(80));
    console.log('\n🕐 System Info:');
    console.log(`   Local Time:  ${new Date().toLocaleString()}`);
    console.log(`   UTC Time:    ${new Date().toISOString()}`);
    console.log(`   Today (ISO): ${new Date().toISOString().split('T')[0]}`);

    // Check account plan
    console.log('\n📊 Account Plan:');
    const plan = await api.getPlan();
    console.log(`   Parallel Sessions: ${plan.parallel_sessions_max_allowed || 'N/A'}`);
    console.log(`   Automate Plan:     ${plan.automate_plan || 'N/A'}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

main();
