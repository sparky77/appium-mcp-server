#!/usr/bin/env node
/**
 * Fetch Test Results from BrowserStack
 * Usage: node scripts/fetch-test-results.js [options]
 * 
 * Options:
 *   --today          Fetch today's test results (default)
 *   --build <id>     Fetch specific build by ID
 *   --session <id>   Fetch specific session by ID
 *   --format <type>  Output format: json, html, console (default: console)
 *   --output <file>  Write output to file
 */

require('dotenv').config();
const { BrowserStackAPI } = require('./browserstack-api');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  mode: 'today',
  format: 'console',
  output: null,
  buildId: null,
  sessionId: null
};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg === '--today') options.mode = 'today';
  else if (arg === '--build' && args[i + 1]) {
    options.mode = 'build';
    options.buildId = args[++i];
  }
  else if (arg === '--session' && args[i + 1]) {
    options.mode = 'session';
    options.sessionId = args[++i];
  }
  else if (arg === '--format' && args[i + 1]) {
    options.format = args[++i];
  }
  else if (arg === '--output' && args[i + 1]) {
    options.output = args[++i];
  }
}

async function main() {
  try {
    console.log('🔄 Connecting to BrowserStack API...\n');
    const api = new BrowserStackAPI();

    let data;

    // Fetch data based on mode
    switch (options.mode) {
      case 'today':
        console.log('📅 Fetching Appium MCP Framework test results...');
        data = await api.getRecentTestResults(10, 'MCP POC run');
        break;

      case 'build':
        console.log(`📦 Fetching build: ${options.buildId}...`);
        const buildInfo = await api.getBuild(options.buildId);
        const sessions = await api.getSessions(options.buildId);
        data = { build: buildInfo, sessions };
        break;

      case 'session':
        console.log(`🔍 Fetching session: ${options.sessionId}...`);
        data = await api.getSession(options.sessionId);
        break;

      default:
        throw new Error(`Unknown mode: ${options.mode}`);
    }

    // Format and output data
    let output;
    
    if (options.format === 'json') {
      output = JSON.stringify(data, null, 2);
    } 
    else if (options.format === 'html' && options.mode === 'today') {
      output = api.generateHTMLReport(data);
    }
    else if (options.format === 'console' && options.mode === 'today') {
      output = formatConsoleOutput(data);
    }
    else {
      output = JSON.stringify(data, null, 2);
    }

    // Write to file or console
    if (options.output) {
      const outputPath = path.resolve(options.output);
      fs.writeFileSync(outputPath, output, 'utf8');
      console.log(`\n✅ Results written to: ${outputPath}`);
    } else {
      console.log('\n' + output);
    }

    // Additional summary for today's results
    if (options.mode === 'today' && options.format === 'console') {
      console.log('\n' + '='.repeat(80));
      console.log('💡 TIP: Generate HTML report with:');
      console.log('   node scripts/fetch-test-results.js --format html --output reports/browserstack-report.html');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

function formatConsoleOutput(results) {
  const lines = [];
  
  lines.push('═'.repeat(80));
  lines.push(`📊 ${results.projectName || 'BROWSERSTACK TEST RESULTS'}`);
  lines.push('═'.repeat(80));
  lines.push('');
  
  // Summary
  lines.push('📈 SUMMARY');
  lines.push('─'.repeat(80));
  lines.push(`  Total Builds:    ${results.totalBuilds}`);
  lines.push(`  Total Sessions:  ${results.totalSessions}`);
  lines.push(`  ✅ Passed:        ${results.passedSessions} (${((results.passedSessions / results.totalSessions) * 100).toFixed(1)}%)`)
  lines.push(`  ❌ Failed:        ${results.failedSessions} (${((results.failedSessions / results.totalSessions) * 100).toFixed(1)}%)`);
  if (results.errorSessions > 0) {
    lines.push(`  ⚠️  Errors:        ${results.errorSessions}`);
  }
  lines.push('');

  // Build details
  results.builds.forEach((build, index) => {
    lines.push(`📦 BUILD ${index + 1}: ${build.buildName}`);
    lines.push('─'.repeat(80));
    lines.push(`  Project:  ${build.projectName}`);
    lines.push(`  Build ID: ${build.buildId}`);
    lines.push(`  Status:   ${build.status.toUpperCase()}`);
    lines.push(`  Duration: ${build.duration}s`);
    lines.push(`  Sessions: ${build.sessions.length}`);
    lines.push('');
    
    // Session details
    build.sessions.forEach((session, idx) => {
      const icon = session.status === 'passed' ? '✅' : session.status === 'failed' ? '❌' : '⚠️';
      lines.push(`  ${icon} [${idx + 1}] ${session.name}`);
      lines.push(`     Device:   ${session.device} (${session.os} ${session.osVersion})`);
      lines.push(`     Duration: ${session.duration || 0}s`);
      if (session.reason) {
        lines.push(`     Reason:   ${session.reason}`);
      }
      lines.push(`     URL:      ${session.publicUrl}`);
      lines.push('');
    });
  });

  lines.push('═'.repeat(80));
  
  return lines.join('\n');
}

// Run
main();
