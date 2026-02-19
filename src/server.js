#!/usr/bin/env node

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
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
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

const server = new AppiumMCPServer();
server.run().catch(console.error);