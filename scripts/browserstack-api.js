/**
 * BrowserStack REST API Client
 * Fetches test sessions, builds, and detailed analytics
 * Documentation: https://www.browserstack.com/docs/app-automate/api-reference/selenium/introduction
 */

const https = require('https');

class BrowserStackAPI {
  constructor() {
    this.username = process.env.BROWSERSTACK_USERNAME;
    this.accessKey = process.env.BROWSERSTACK_ACCESS_KEY;
    
    if (!this.username || !this.accessKey) {
      throw new Error('BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY must be set');
    }
    
    this.baseUrl = 'api.browserstack.com';
    this.basePath = '/app-automate'; // App Automate (mobile) — NOT /automate (web)
    this.auth = Buffer.from(`${this.username}:${this.accessKey}`).toString('base64');
  }

  /**
   * Make authenticated HTTPS request to BrowserStack API
   */
  async request(path, method = 'GET') {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.baseUrl,
        path: path,
        method: method,
        headers: {
          'Authorization': `Basic ${this.auth}`,
          'Content-Type': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } catch (e) {
            resolve(data);
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.end();
    });
  }

  /**
   * Get list of builds for a project
   * @param {number} limit - Number of builds to fetch (default: 10)
   */
  async getBuilds(limit = 10) {
    return await this.request(`/app-automate/builds.json?limit=${limit}`);
  }

  /**
   * Get specific build details
   * @param {string} buildId - BrowserStack build ID
   */
  async getBuild(buildId) {
    return await this.request(`/app-automate/builds/${buildId}.json`);
  }

  /**
   * Get sessions for a specific build
   * @param {string} buildId - BrowserStack build ID
   * @param {number} limit - Number of sessions to fetch (default: 100)
   */
  async getSessions(buildId, limit = 100) {
    return await this.request(`/app-automate/builds/${buildId}/sessions.json?limit=${limit}`);
  }

  /**
   * Get detailed session information
   * @param {string} sessionId - BrowserStack session ID (hashed_id)
   */
  async getSession(sessionId) {
    return await this.request(`/app-automate/sessions/${sessionId}.json`);
  }

  /**
   * Get session logs
   * @param {string} sessionId - BrowserStack session ID (hashed_id)
   */
  async getSessionLogs(sessionId) {
    return await this.request(`/app-automate/sessions/${sessionId}/logs`);
  }

  /**
   * Get network logs for a session
   * @param {string} sessionId - BrowserStack session ID (hashed_id)
   */
  async getNetworkLogs(sessionId) {
    return await this.request(`/app-automate/sessions/${sessionId}/networklogs`);
  }

  /**
   * Get Appium logs for a session
   * @param {string} sessionId - BrowserStack session ID (hashed_id)
   */
  async getAppiumLogs(sessionId) {
    return await this.request(`/app-automate/sessions/${sessionId}/appiumlogs`);
  }

  /**
   * Update session status and name
   * @param {string} sessionId - BrowserStack session ID
   * @param {object} data - { status: 'passed'|'failed', reason: 'string', name: 'string' }
   */
  async updateSession(sessionId, data) {
    // Note: This is done via browser.execute() during test execution
    // Keeping here for reference
    console.warn('Session updates should be done via browser.execute() during test execution');
    return null;
  }

  /**
   * Get plan details (concurrent sessions available, etc.)
   */
  async getPlan() {
    return await this.request('/app-automate/plan.json');
  }

  /**
   * Get recent test results (no date filtering possible - API lacks timestamps)
   * @param {number} limit - Number of recent builds to include (default: 10)
   * @param {string} projectFilter - Filter by project name (default: 'Appium MCP Framework')
   */
  async getRecentTestResults(limit = 10, projectFilter = 'Appium MCP Framework') {
    const allBuilds = await this.getBuilds(limit * 2); // Fetch more to account for filtering
    
    // Filter by build name or project name (App Automate often has no project_name)
    const builds = allBuilds.filter(build => {
      const projectName = build.automation_build?.project_name || '';
      const buildName = build.automation_build?.name || '';
      if (!projectFilter) return true;
      return projectName === projectFilter || buildName.includes(projectFilter);
    }).slice(0, limit);
    
    const results = {
      projectName: projectFilter,
      totalBuilds: builds.length,
      builds: []
    };

    for (const build of builds) {
      const buildId = build.automation_build.hashed_id;
      const sessions = await this.getSessions(buildId);
      
      const buildSummary = {
        buildId: buildId,
        buildName: build.automation_build.name || 'Unnamed Build',
        projectName: build.automation_build.project_name || 'Unknown Project',
        duration: build.automation_build.duration || 0,
        status: build.automation_build.status || 'unknown',
        sessions: (sessions || []).map(s => ({
          sessionId: s.automation_session?.hashed_id || 'unknown',
          name: s.automation_session?.name || 'Unnamed Session',
          status: s.automation_session?.status || 'unknown',
          duration: s.automation_session?.duration || 0,
          device: s.automation_session?.device || 'Unknown Device',
          os: s.automation_session?.os || 'Unknown OS',
          osVersion: s.automation_session?.os_version || 'Unknown',
          reason: s.automation_session?.reason || null,
          publicUrl: s.automation_session?.public_url || '#',
          videoUrl: s.automation_session?.video_url || '#',
          logs: s.automation_session?.logs || '#'
        }))
      };

      results.builds.push(buildSummary);
    }

    // Calculate totals
    results.totalSessions = results.builds.reduce((sum, b) => sum + b.sessions.length, 0);
    results.passedSessions = results.builds.reduce((sum, b) => 
      sum + b.sessions.filter(s => s.status === 'passed').length, 0);
    results.failedSessions = results.builds.reduce((sum, b) => 
      sum + b.sessions.filter(s => s.status === 'failed').length, 0);
    results.errorSessions = results.builds.reduce((sum, b) => 
      sum + b.sessions.filter(s => s.status === 'error').length, 0);

    return results;
  }

  /**
   * Generate HTML report of test results
   */
  generateHTMLReport(results) {
    const passRate = ((results.passedSessions / results.totalSessions) * 100).toFixed(1);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BrowserStack Test Results - ${results.date}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f7fa; padding: 20px; }
    .container { max-width: 1400px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
    .header h1 { font-size: 32px; margin-bottom: 10px; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .stat-card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .stat-card h3 { color: #666; font-size: 14px; margin-bottom: 10px; text-transform: uppercase; }
    .stat-card .value { font-size: 36px; font-weight: bold; color: #333; }
    .stat-card.passed .value { color: #48bb78; }
    .stat-card.failed .value { color: #f56565; }
    .stat-card.rate .value { color: #667eea; }
    .build { background: white; border-radius: 10px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .build-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 2px solid #e2e8f0; }
    .build-name { font-size: 20px; font-weight: bold; color: #333; }
    .build-status { padding: 5px 15px; border-radius: 20px; font-size: 14px; font-weight: bold; }
    .build-status.passed { background: #c6f6d5; color: #22543d; }
    .build-status.failed { background: #fed7d7; color: #742a2a; }
    .sessions { display: grid; gap: 10px; }
    .session { display: grid; grid-template-columns: 40px 3fr 1fr 1fr 1fr 100px; gap: 15px; align-items: center; padding: 15px; background: #f7fafc; border-radius: 8px; border-left: 4px solid #e2e8f0; }
    .session.passed { border-left-color: #48bb78; }
    .session.failed { border-left-color: #f56565; }
    .session-icon { font-size: 24px; }
    .session-name { font-weight: 500; color: #333; }
    .session-device { color: #666; font-size: 14px; }
    .session-duration { color: #666; font-size: 14px; }
    .session-link { text-align: right; }
    .session-link a { color: #667eea; text-decoration: none; font-weight: 500; }
    .session-link a:hover { text-decoration: underline; }
    .footer { text-align: center; margin-top: 40px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 BrowserStack Test Results</h1>
      <p>Test Execution Report for ${results.date}</p>
    </div>

    <div class="stats">
      <div class="stat-card">
        <h3>Total Sessions</h3>
        <div class="value">${results.totalSessions}</div>
      </div>
      <div class="stat-card passed">
        <h3>Passed</h3>
        <div class="value">${results.passedSessions}</div>
      </div>
      <div class="stat-card failed">
        <h3>Failed</h3>
        <div class="value">${results.failedSessions}</div>
      </div>
      <div class="stat-card rate">
        <h3>Pass Rate</h3>
        <div class="value">${passRate}%</div>
      </div>
    </div>

    ${results.builds.map(build => `
      <div class="build">
        <div class="build-header">
          <div>
            <div class="build-name">${build.buildName}</div>
            <div style="color: #666; font-size: 14px; margin-top: 5px;">
              ${build.projectName} • ${build.sessions.length} sessions • ${build.duration}s
            </div>
          </div>
          <div class="build-status ${build.status}">${build.status.toUpperCase()}</div>
        </div>
        
        <div class="sessions">
          ${build.sessions.map(session => `
            <div class="session ${session.status}">
              <div class="session-icon">${session.status === 'passed' ? '✅' : '❌'}</div>
              <div>
                <div class="session-name">${session.name}</div>
                ${session.reason ? `<div style="color: #e53e3e; font-size: 12px; margin-top: 3px;">${session.reason}</div>` : ''}
              </div>
              <div class="session-device">${session.device}</div>
              <div class="session-device">${session.os} ${session.osVersion}</div>
              <div class="session-duration">${session.duration || 0}s</div>
              <div class="session-link">
                <a href="${session.publicUrl}" target="_blank">View →</a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')}

    <div class="footer">
      <p>Generated by Appium MCP Server v0.3.0 • ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>`;
  }
}

module.exports = { BrowserStackAPI };
