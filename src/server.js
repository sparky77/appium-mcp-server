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
const { BrowserStackAPI } = require('../scripts/browserstack-api.js');

// Constants
const MAX_LOG_CHARS = 8000; // Maximum characters to return from logs (from end for recent errors)

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
    this.bsApi = null; // Lazy initialize BrowserStack API

    this.currentPage = null;
    this.setupTools();
  }

  getBrowserStackAPI() {
    if (!this.bsApi) {
      try {
        this.bsApi = new BrowserStackAPI();
      } catch (error) {
        throw new Error(`BrowserStack API not configured: ${error.message}`);
      }
    }
    return this.bsApi;
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
              buildFilter: { type: "string", description: "Optional filter string to match build names (e.g. 'MCP POC run')" },
              limit: { type: "number", description: "Number of builds to fetch (default: 5, max: 20)", default: 5 }
            }
          }
        },
        {
          name: "get_build_sessions",
          description: "Get all sessions for a specific BrowserStack build with detailed status information",
          inputSchema: {
            type: "object",
            properties: {
              buildId: { type: "string", description: "BrowserStack build ID (hashed_id from get_test_results)" }
            },
            required: ["buildId"]
          }
        },
        {
          name: "get_session_details",
          description: "Get detailed information about a specific test session including device, status, URLs, and failure reasons",
          inputSchema: {
            type: "object",
            properties: {
              sessionId: { type: "string", description: "BrowserStack session ID (hashed_id from get_test_results)" }
            },
            required: ["sessionId"]
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
        },
        {
          name: "get_browserstack_plan",
          description: "Get BrowserStack account plan details including parallel session limits and usage",
          inputSchema: {
            type: "object",
            properties: {}
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      // BrowserStack API tools — no device session needed
      try {
        if (name === "get_test_results") return await this.handleGetTestResults(args.buildFilter, args.limit);
        if (name === "get_build_sessions") return await this.handleGetBuildSessions(args.buildId);
        if (name === "get_session_details") return await this.handleGetSessionDetails(args.sessionId);
        if (name === "get_session_logs") return await this.handleGetSessionLogs(args.sessionId);
        if (name === "get_browserstack_plan") return await this.handleGetBrowserStackPlan();
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

  // ─── BrowserStack API Handlers ───────────────────────────────────────────────

  async handleGetTestResults(buildFilter, limit = 5) {
    const api = this.getBrowserStackAPI();
    const builds = await api.getBuilds(Math.min(limit, 20));

    if (!Array.isArray(builds) || builds.length === 0) {
      return { content: [{ type: "text", text: "No builds found. Run some tests first." }] };
    }

    const filtered = builds
      .filter(b => {
        if (!buildFilter) return true;
        const name = b.automation_build?.name || '';
        return name.toLowerCase().includes(buildFilter.toLowerCase());
      })
      .slice(0, limit);

    const summary = await Promise.all(filtered.map(async (b) => {
      const build = b.automation_build;
      const sessions = await api.getSessions(build.hashed_id);
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

  async handleGetBuildSessions(buildId) {
    const api = this.getBrowserStackAPI();
    const sessions = await api.getSessions(buildId);
    
    if (!Array.isArray(sessions) || sessions.length === 0) {
      return { content: [{ type: "text", text: `No sessions found for build ${buildId}` }] };
    }

    const sessionDetails = sessions.map(s => ({
      sessionId: s.automation_session.hashed_id,
      name: s.automation_session.name || 'Unnamed Session',
      status: s.automation_session.status,
      duration: s.automation_session.duration || 0,
      device: s.automation_session.device,
      os: s.automation_session.os,
      osVersion: s.automation_session.os_version,
      reason: s.automation_session.reason || null,
      publicUrl: s.automation_session.public_url,
      videoUrl: s.automation_session.video_url || null
    }));

    const failed = sessionDetails.filter(s => s.status === 'failed');

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          buildId: buildId,
          totalSessions: sessionDetails.length,
          passedSessions: sessionDetails.filter(s => s.status === 'passed').length,
          failedSessions: failed.length,
          sessions: sessionDetails,
          tip: failed.length > 0
            ? `${failed.length} session(s) failed. Use get_session_logs to see error details.`
            : 'All sessions passed!'
        }, null, 2)
      }]
    };
  }

  async handleGetSessionDetails(sessionId) {
    const api = this.getBrowserStackAPI();
    const session = await api.getSession(sessionId);
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          sessionId: session.automation_session.hashed_id,
          name: session.automation_session.name,
          status: session.automation_session.status,
          duration: session.automation_session.duration,
          device: session.automation_session.device,
          os: session.automation_session.os,
          osVersion: session.automation_session.os_version,
          appiumVersion: session.automation_session.appium_version,
          reason: session.automation_session.reason || 'No failure reason',
          publicUrl: session.automation_session.public_url,
          videoUrl: session.automation_session.video_url,
          logs: session.automation_session.logs,
          tip: session.automation_session.status === 'failed'
            ? 'Use get_session_logs to see the full Appium logs and identify the exact error'
            : 'Session passed successfully'
        }, null, 2)
      }]
    };
  }

  async handleGetSessionLogs(sessionId) {
    const api = this.getBrowserStackAPI();
    const logs = await api.getSessionLogs(sessionId);

    const logText = typeof logs === 'string' ? logs : JSON.stringify(logs, null, 2);
    const truncated = logText.length > MAX_LOG_CHARS
      ? `... (log truncated, showing last ${MAX_LOG_CHARS} chars)\n\n` + logText.slice(-MAX_LOG_CHARS)
      : logText;

    return {
      content: [{
        type: "text",
        text: `Appium logs for session ${sessionId}:\n\n${truncated}`
      }]
    };
  }

  async handleGetBrowserStackPlan() {
    const api = this.getBrowserStackAPI();
    const plan = await api.getPlan();
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          parallelSessions: plan.parallel_sessions_max_allowed,
          parallelSessionsRunning: plan.parallel_sessions_running,
          maxDuration: plan.max_duration,
          queued: plan.queued_sessions,
          queuedMax: plan.queued_sessions_max_allowed,
          teamParallelSessions: plan.team_parallel_sessions_max_allowed
        }, null, 2)
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
  get_test_results  [buildFilter] [limit]
    Fetch recent BrowserStack builds + sessions with pass/fail status.
    Returns session IDs for use with other tools.
    Args: buildFilter (string, optional), limit (number, default: 5)

  get_build_sessions  <buildId>
    Get all sessions for a specific build with detailed status info.
    Args: buildId (string) - from get_test_results output

  get_session_details  <sessionId>
    Get detailed session info including device, URLs, and failure reasons.
    Args: sessionId (string) - from get_test_results or get_build_sessions

  get_session_logs  <sessionId>
    Fetch full Appium logs for a session - shows exact errors,
    selectors attempted, ElementNotFound stack traces.
    Args: sessionId (string) - from get_test_results output

  get_browserstack_plan
    Get BrowserStack plan details (parallel sessions, usage, etc.)
    Args: none

─────────────────────────────────────────────────────
Total: 12 tools  |  Requires: BROWSERSTACK_USERNAME, BROWSERSTACK_ACCESS_KEY, BS_APP_REFERENCE
Run without flags to start MCP server (connects via Claude Desktop / VS Code Copilot)
`);
  process.exit(0);
}

const server = new AppiumMCPServer();
server.run().catch(console.error);