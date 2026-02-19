#!/usr/bin/env node
/**
 * Generate Real-Time Test Dashboard
 * Fetches BrowserStack data and generates interactive HTML dashboard
 * 
 * Usage: node scripts/generate-dashboard.js [--output path]
 */

require('dotenv').config();
const { BrowserStackAPI } = require('./browserstack-api');
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    const outputPath = process.argv.includes('--output') 
      ? process.argv[process.argv.indexOf('--output') + 1]
      : 'reports/dashboard.html';

    console.log('🔄 Fetching data from BrowserStack...');
    const api = new BrowserStackAPI();
    
    const [results, plan] = await Promise.all([
      api.getRecentTestResults(5, 'MCP POC run'), // Last 5 MCP builds only
      api.getPlan()
    ]);

    // Check if we have any results
    if (!results || results.totalBuilds === 0) {
      console.log('⚠️  No builds found in BrowserStack account.');
      console.log('💡 Tip: Run some tests first, then generate the dashboard.');
      process.exit(0);
    }

    console.log('📊 Generating interactive dashboard...');
    console.log(`   Found ${results.totalBuilds} builds with ${results.totalSessions} sessions`);
    const html = generateDashboard(results, plan);

    const fullPath = path.resolve(outputPath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, html, 'utf8');

    console.log(`✅ Dashboard generated: ${fullPath}`);
    console.log(`🌐 Open in browser: file:///${fullPath.replace(/\\/g, '/')}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

function generateDashboard(results, plan) {
  const passRate = results.totalSessions > 0 
    ? ((results.passedSessions / results.totalSessions) * 100).toFixed(1)
    : 0;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Dashboard - ${results.date}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: white; }
    
    .dashboard { display: grid; grid-template-columns: 1fr; gap: 20px; padding: 20px; max-width: 1600px; margin: 0 auto; }
    
    .header { grid-column: 1 / -1; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 20px; }
    .header h1 { font-size: 42px; margin-bottom: 10px; }
    .header p { font-size: 18px; opacity: 0.9; }
    
    .stats-grid { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
    
    .stat-card {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      padding: 30px;
      border-radius: 15px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      position: relative;
      overflow: hidden;
    }
    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #667eea, #764ba2);
    }
    .stat-card.passed::before { background: #48bb78; }
    .stat-card.failed::before { background: #f56565; }
    .stat-card.warning::before { background: #ed8936; }
    
    .stat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .stat-icon { font-size: 32px; opacity: 0.8; }
    .stat-label { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.7; }
    .stat-value { font-size: 48px; font-weight: bold; margin: 10px 0; }
    .stat-trend { font-size: 14px; opacity: 0.6; }
    
    .chart-container {
      background: #1e293b;
      padding: 30px;
      border-radius: 15px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .chart-title { font-size: 20px; margin-bottom: 20px; font-weight: 600; }
    
    .pass-rate-circle {
      width: 200px;
      height: 200px;
      margin: 20px auto;
      position: relative;
    }
    .circle-bg, .circle-progress {
      fill: none;
      stroke-width: 20;
    }
    .circle-bg { stroke: #334155; }
    .circle-progress { 
      stroke: url(#gradient);
      stroke-linecap: round;
      transform: rotate(-90deg);
      transform-origin: center;
      transition: stroke-dashoffset 1s ease;
    }
    .circle-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
    }
    .circle-percentage { font-size: 48px; font-weight: bold; }
    .circle-label { font-size: 14px; opacity: 0.6; }
    
    .builds-list { grid-column: 1 / -1; }
    .build-card {
      background: #1e293b;
      border-radius: 15px;
      padding: 25px;
      margin-bottom: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .build-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .build-title { font-size: 22px; font-weight: 600; }
    .build-meta { font-size: 14px; opacity: 0.6; margin-top: 5px; }
    .build-badge {
      padding: 8px 20px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: bold;
      text-transform: uppercase;
    }
    .build-badge.passed { background: rgba(72, 187, 120, 0.2); color: #48bb78; }
    .build-badge.failed { background: rgba(245, 101, 101, 0.2); color: #f56565; }
    
    .sessions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 15px;
    }
    .session-card {
      background: #334155;
      padding: 20px;
      border-radius: 10px;
      border-left: 4px solid #64748b;
    }
    .session-card.passed { border-left-color: #48bb78; }
    .session-card.failed { border-left-color: #f56565; }
    .session-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }
    .session-icon { font-size: 24px; }
    .session-name { font-weight: 500; font-size: 16px; flex: 1; }
    .session-details { font-size: 13px; opacity: 0.7; line-height: 1.6; }
    .session-link {
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    .session-link a {
      color: #667eea;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
    }
    .session-link a:hover { text-decoration: underline; }
    
    .footer {
      grid-column: 1 / -1;
      text-align: center;
      padding: 40px;
      opacity: 0.5;
      font-size: 14px;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .stat-card, .build-card { animation: fadeIn 0.5s ease-out; }
  </style>
</head>
<body>
  <div class="dashboard">
    <div class="header">
      <h1>🚀 Test Execution Dashboard</h1>
      <p>Real-time test results from BrowserStack • ${results.date}</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-header">
          <div class="stat-label">Total Sessions</div>
          <div class="stat-icon">📊</div>
        </div>
        <div class="stat-value">${results.totalSessions}</div>
        <div class="stat-trend">Across ${results.totalBuilds} builds</div>
      </div>

      <div class="stat-card passed">
        <div class="stat-header">
          <div class="stat-label">Passed</div>
          <div class="stat-icon">✅</div>
        </div>
        <div class="stat-value">${results.passedSessions}</div>
        <div class="stat-trend">${passRate}% success rate</div>
      </div>

      <div class="stat-card failed">
        <div class="stat-header">
          <div class="stat-label">Failed</div>
          <div class="stat-icon">❌</div>
        </div>
        <div class="stat-value">${results.failedSessions}</div>
        <div class="stat-trend">${results.totalSessions > 0 ? ((results.failedSessions / results.totalSessions) * 100).toFixed(1) : 0}% failure rate</div>
      </div>

      <div class="stat-card warning">
        <div class="stat-header">
          <div class="stat-label">Parallel Limit</div>
          <div class="stat-icon">⚡</div>
        </div>
        <div class="stat-value">${plan.parallel_sessions_max_allowed || 'N/A'}</div>
        <div class="stat-trend">Concurrent sessions</div>
      </div>
    </div>

    <div class="chart-container">
      <div class="chart-title">Pass Rate</div>
      <div class="pass-rate-circle">
        <svg width="200" height="200">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#48bb78;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#38a169;stop-opacity:1" />
            </linearGradient>
          </defs>
          <circle class="circle-bg" cx="100" cy="100" r="80"/>
          <circle class="circle-progress" cx="100" cy="100" r="80"
            stroke-dasharray="${2 * Math.PI * 80}"
            stroke-dashoffset="${2 * Math.PI * 80 * (1 - passRate / 100)}"/>
        </svg>
        <div class="circle-text">
          <div class="circle-percentage">${passRate}%</div>
          <div class="circle-label">Pass Rate</div>
        </div>
      </div>
    </div>

    <div class="builds-list">
      <h2 style="font-size: 28px; margin-bottom: 20px;">📦 Build Details</h2>
      
      ${results.builds.map(build => `
        <div class="build-card">
          <div class="build-header">
            <div>
              <div class="build-title">${build.buildName}</div>
              <div class="build-meta">
                ${build.projectName} • ${build.sessions.length} sessions • ${build.duration}s duration
              </div>
            </div>
            <div class="build-badge ${build.status}">${build.status}</div>
          </div>
          
          <div class="sessions-grid">
            ${build.sessions.map(session => `
              <div class="session-card ${session.status}">
                <div class="session-header">
                  <div class="session-icon">${session.status === 'passed' ? '✅' : '❌'}</div>
                  <div class="session-name">${session.name}</div>
                </div>
                <div class="session-details">
                  📱 ${session.device}<br>
                  🖥️ ${session.os} ${session.osVersion}<br>
                  ⏱️ ${session.duration || 0}s
                  ${session.reason ? `<br>⚠️ ${session.reason}` : ''}
                </div>
                <div class="session-link">
                  <a href="${session.publicUrl}" target="_blank">View Session →</a>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>

    <div class="footer">
      Generated by Appium MCP Server v0.3.0 • ${new Date().toLocaleString()}<br>
      <a href="https://github.com/yourusername/appium-mcp-server" style="color: #667eea;">GitHub</a>
    </div>
  </div>
</body>
</html>`;
}

main();
