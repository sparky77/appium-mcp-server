#!/usr/bin/env node

require('dotenv').config();
const https = require('https');
const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { CallToolRequestSchema, ListToolsRequestSchema } = require("@modelcontextprotocol/sdk/types.js");
const { AppiumSession } = require('./appium/session.js');
const { GestureEngine } = require('./gestures/engine.js');
const { ScreenAnalyzer } = require('./analysis/screen.js');
const { CoverageAnalyzer } = require('./coverage/analyzer.js');
const { FeatureGenerator } = require('./cucumber/generator.js');

class AppiumMCPServer {
  constructor() {
    this.server = new Server(
      { name: "appium-browserstack-server", version: "0.1.0" },
      { capabilities: { tools: {} } }
    );

    this.session = new AppiumSession();
    this.gestures = new GestureEngine();
    this.analyzer = new ScreenAnalyzer();
    this.coverage = new CoverageAnalyzer();
    this.generator = new FeatureGenerator();

    this.currentPage = null;
    this.setupTools();
  }

  setupTools() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "inspect_screen",
          description: "Analyze current mobile screen and track coverage",
          inputSchema: { type: "object", properties: {} }
        },
        {
          name: "handle_firebase_auth",
          description: "Navigate Firebase authentication flow",
          inputSchema: {
            type: "object",
            properties: {
              email: { type: "string", description: "Email for login" },
              password: { type: "string", description: "Password for login" }
            },
            required: ["email", "password"]
          }
        },
        {
          name: "smart_action", 
          description: "Perform intelligent action and track coverage",
          inputSchema: {
            type: "object",
            properties: {
              action: { type: "string", description: "Natural language action" }
            },
            required: ["action"]
          }
        },
        {
          name: "gesture",
          description: "Execute specific gesture and track coverage",
          inputSchema: {
            type: "object", 
            properties: {
              type: { type: "string", enum: ["tap", "swipe", "scroll", "long_press", "back"] },
              target: { type: "string", description: "Element description" },
              params: { type: "object", description: "Gesture parameters" }
            },
            required: ["type", "target"]
          }
        },
        {
          name: "finalize_page",
          description: "Complete current page analysis and generate test coverage report",
          inputSchema: {
            type: "object",
            properties: {
              pageName: { type: "string", description: "Name for this page" }
            },
            required: ["pageName"]
          }
        },
        {
          name: "analyze_gaps",
          description: "Analyze coverage gaps for current or all pages",
          inputSchema: {
            type: "object",
            properties: {
              scope: { type: "string", enum: ["current", "all"], default: "current" }
            }
          }
        },
        {
          name: "generate_cucumber",
          description: "Generate Cucumber feature files from page analysis",
          inputSchema: {
            type: "object",
            properties: {
              pageName: { type: "string", description: "Specific page or 'all'" },
              includeGaps: { type: "boolean", default: true, description: "Include gap-based scenarios" }
            }
          }
        },
        {
          name: "get_test_results",
          description: "Fetch recent BrowserStack test results - builds, sessions, pass/fail status and public URLs",
          inputSchema: {
            type: "object",
            properties: {
              buildFilter: { type: "string", description: "Optional filter string to match build names (e.g. 'MCP POC run')" }
            }
          }
        },
        {
          name: "get_session_logs",
          description: "Fetch Appium logs for a specific BrowserStack session - shows exact errors, selectors attempted, and stack traces",
          inputSchema: {
            type: "object",
            properties: {
              sessionId: { type: "string", description: "BrowserStack session ID (hashed_id from get_test_results)" }
            },
            required: ["sessionId"]
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      // BrowserStack API tools — no device session needed
      try {
        if (name === "get_test_results") return await this.handleGetTestResults(args.buildFilter);
        if (name === "get_session_logs") return await this.handleGetSessionLogs(args.sessionId);
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }] };
      }

      // Device tools — require live Appium session on BrowserStack
      try {
        const driver = await this.session.getDriver();

        switch (name) {
          case "inspect_screen":
            return await this.handleInspectScreen(driver);
          case "handle_firebase_auth":
            return await this.handleFirebaseAuth(driver, args.email, args.password);
          case "smart_action":
            return await this.handleSmartAction(driver, args.action);
          case "gesture":
            return await this.handleGesture(driver, args);
          case "finalize_page":
            return await this.handleFinalizePage(args.pageName);
          case "analyze_gaps":
            return await this.handleAnalyzeGaps(args.scope);
          case "generate_cucumber":
            return await this.handleGenerateCucumber(args.pageName, args.includeGaps);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }] };
      }
    });
  }

  async handleInspectScreen(driver) {
    const analysis = await this.analyzer.analyze(driver);
    
    // Track coverage for current screen
    const screenData = JSON.parse(analysis.content[0].text);
    this.coverage.trackScreen(screenData);
    
    return analysis;
  }

  async handleGesture(driver, args) {
    const result = await this.gestures.execute(driver, args);
    
    // Track gesture coverage
    this.coverage.trackGesture(args.type, args.target, result);
    
    return result;
  }

  async handleSmartAction(driver, action) {
    const analysis = await this.analyzer.analyze(driver);
    const element = this.analyzer.findElementByDescription(analysis, action);
    
    if (element) {
      const gestureType = this.parseActionToGesture(action);
      const result = await this.gestures.execute(driver, {
        type: gestureType,
        target: element,
        params: {}
      });
      
      // Track action coverage
      this.coverage.trackAction(action, element, result);
      return result;
    }
    
    const result = { content: [{ type: "text", text: `Could not understand action: ${action}` }] };
    this.coverage.trackAction(action, null, result);
    return result;
  }

  async handleFinalizePage(pageName) {
    // Generate comprehensive page analysis
    const pageAnalysis = this.coverage.finalizePage(pageName);
    this.currentPage = pageName;
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          page: pageName,
          summary: pageAnalysis.summary,
          elements_tested: pageAnalysis.elementsFound,
          interactions_tested: pageAnalysis.interactionsTested,
          coverage_gaps: pageAnalysis.gaps,
          suggested_tests: pageAnalysis.suggestions,
          risk_assessment: pageAnalysis.risks
        }, null, 2)
      }]
    };
  }

  async handleAnalyzeGaps(scope = 'current') {
    const gapAnalysis = this.coverage.analyzeGaps(scope);
    
    return {
      content: [{
        type: "text", 
        text: JSON.stringify({
          scope: scope,
          overall_coverage: gapAnalysis.overallCoverage,
          critical_gaps: gapAnalysis.criticalGaps,
          medium_gaps: gapAnalysis.mediumGaps,
          low_priority_gaps: gapAnalysis.lowPriorityGaps,
          recommendations: gapAnalysis.recommendations,
          next_actions: gapAnalysis.nextActions
        }, null, 2)
      }]
    };
  }

  async handleGenerateCucumber(pageName, includeGaps = true) {
    const features = this.generator.generateFeatures(this.coverage, pageName, includeGaps);
    
    return {
      content: [{
        type: "text",
        text: `Generated Cucumber Features:\n\n${features}`
      }]
    };
  }

  async handleFirebaseAuth(driver, email, password) {
    const contexts = await driver.getContexts();
    const hasWebview = contexts.some(ctx => ctx.includes('WEBVIEW'));
    
    if (hasWebview) {
      const webviewContext = contexts.find(ctx => ctx.includes('WEBVIEW'));
      await driver.switchContext(webviewContext);
      
      await driver.$('input[type="email"]').setValue(email);
      await driver.$('input[type="password"]').setValue(password);
      await driver.$('button[type="submit"]').click();
      
      await driver.pause(3000);
      await driver.switchContext('NATIVE_APP');
      
      const result = { content: [{ type: "text", text: `Firebase auth completed for ${email}` }] };
      this.coverage.trackAuthFlow('firebase_webview', true);
      return result;
    } else {
      const emailField = await this.gestures.resolveTarget(driver, 'email');
      const passwordField = await this.gestures.resolveTarget(driver, 'password');
      const loginButton = await this.gestures.resolveTarget(driver, 'login');
      
      if (emailField && passwordField && loginButton) {
        await emailField.setValue(email);
        await passwordField.setValue(password);
        await loginButton.click();
        
        const result = { content: [{ type: "text", text: `Native auth completed for ${email}` }] };
        this.coverage.trackAuthFlow('firebase_native', true);
        return result;
      }
    }
    
    this.coverage.trackAuthFlow('firebase_failed', false);
    throw new Error("Could not find Firebase auth elements");
  }

  // ─── BrowserStack API Engine ───────────────────────────────────────────────

  bsApiRequest(path, expectJson = true) {
    return new Promise((resolve, reject) => {
      const auth = Buffer.from(
        `${process.env.BROWSERSTACK_USERNAME}:${process.env.BROWSERSTACK_ACCESS_KEY}`
      ).toString('base64');

      const options = {
        hostname: 'api-cloud.browserstack.com',
        path,
        method: 'GET',
        headers: { 'Authorization': `Basic ${auth}`, 'Accept': 'application/json' }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (expectJson) {
            try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
          } else {
            resolve(data);
          }
        });
      });
      req.on('error', reject);
      req.end();
    });
  }

  async handleGetTestResults(buildFilter) {
    const builds = await this.bsApiRequest('/app-automate/builds.json');

    if (!Array.isArray(builds) || builds.length === 0) {
      return { content: [{ type: "text", text: "No builds found. Run some tests first." }] };
    }

    const filtered = builds
      .filter(b => {
        if (!buildFilter) return true;
        const name = b.automation_build?.name || '';
        return name.toLowerCase().includes(buildFilter.toLowerCase());
      })
      .slice(0, 5);

    const summary = await Promise.all(filtered.map(async (b) => {
      const build = b.automation_build;
      const sessions = await this.bsApiRequest(`/app-automate/builds/${build.hashed_id}/sessions.json`);
      const sessionList = Array.isArray(sessions) ? sessions : [];

      return {
        buildId: build.hashed_id,
        buildName: build.name,
        status: build.status,
        duration: build.duration,
        sessions: sessionList.map(s => ({
          sessionId: s.automation_session.hashed_id,
          name: s.automation_session.name,
          status: s.automation_session.status,
          duration: s.automation_session.duration,
          reason: s.automation_session.reason || null,
          device: s.automation_session.device,
          publicUrl: s.automation_session.public_url
        }))
      };
    }));

    const failed = summary.flatMap(b => b.sessions.filter(s => s.status === 'failed'));

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          totalBuilds: summary.length,
          builds: summary,
          failedSessions: failed,
          tip: failed.length > 0
            ? `Use get_session_logs with sessionId to see the Appium error for any failed session`
            : 'All sessions passed'
        }, null, 2)
      }]
    };
  }

  async handleGetSessionLogs(sessionId) {
    const logs = await this.bsApiRequest(
      `/app-automate/sessions/${sessionId}/logs`,
      false  // plain text, not JSON
    );

    const truncated = typeof logs === 'string' && logs.length > 6000
      ? logs.slice(0, 6000) + '\n... (truncated - showing first 6000 chars)'
      : logs;

    return {
      content: [{
        type: "text",
        text: `Appium logs for session ${sessionId}:\n\n${truncated}`
      }]
    };
  }

  // ───────────────────────────────────────────────────────────────────────────

  parseActionToGesture(action) {
    const lower = action.toLowerCase();
    if (lower.includes('tap') || lower.includes('click')) return 'tap';
    if (lower.includes('swipe') || lower.includes('scroll')) return 'scroll';
    if (lower.includes('long press')) return 'long_press';
    return 'tap';
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Appium MCP server with coverage analysis running");
  }
}

// ─── CLI help mode ──────────────────────────────────────────────────────────
if (process.argv.includes('--help') || process.argv.includes('-h') || process.argv.includes('--list')) {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║          Appium MCP Server - Available Tools                 ║
╚══════════════════════════════════════════════════════════════╝

DEVICE CONTROL (live Appium session on BrowserStack)
─────────────────────────────────────────────────────
  inspect_screen
    Analyse current mobile screen, list all elements + selectors.
    Usage: no arguments needed

  smart_action  <action>
    Natural language command e.g. "tap search button"
    Args: action (string)

  gesture  <type> <target>
    Execute tap / swipe / scroll / long_press / back
    Args: type (enum), target (string), params (object, optional)

  handle_firebase_auth  <email> <password>
    Handle webview-based auth flows (context switching)
    Args: email (string), password (string)

COVERAGE & REPORTING
─────────────────────────────────────────────────────
  finalize_page  <pageName>
    Generate coverage report for the current page
    Args: pageName (string)

  analyze_gaps  [scope]
    Find untested elements and missing scenarios
    Args: scope ("current" | "all", default: "current")

  generate_cucumber  [pageName] [includeGaps]
    Auto-generate Cucumber feature files from screen exploration
    Args: pageName (string), includeGaps (boolean, default: true)

BROWSERSTACK API ENGINE (test intelligence - no device needed)
─────────────────────────────────────────────────────
  get_test_results  [buildFilter]
    Fetch recent BrowserStack builds + sessions with pass/fail status.
    Returns session IDs for use with get_session_logs.
    Args: buildFilter (string, optional) e.g. "MCP POC run"

  get_session_logs  <sessionId>
    Fetch full Appium logs for a session - shows exact errors,
    selectors attempted, ElementNotFound stack traces.
    Args: sessionId (string) - from get_test_results output

─────────────────────────────────────────────────────
Total: 9 tools  |  Requires: BROWSERSTACK_USERNAME, BROWSERSTACK_ACCESS_KEY, BS_APP_REFERENCE
Run without flags to start MCP server (connects via Claude Desktop / VS Code Copilot)
`);
  process.exit(0);
}

const server = new AppiumMCPServer();
server.run().catch(console.error);