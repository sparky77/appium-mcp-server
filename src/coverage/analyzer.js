class CoverageAnalyzer {
  constructor() {
    this.pages = new Map();
    this.globalCoverage = {
      totalElements: 0,
      testedElements: 0,
      userPaths: [],
      errorScenarios: [],
      platforms: new Set(),
      accessibility: {
        tested: false,
        issues: []
      }
    };
  }

  trackScreen(screenData) {
    const pageName = this.inferPageName(screenData);
    
    if (!this.pages.has(pageName)) {
      this.pages.set(pageName, {
        name: pageName,
        elements: new Map(),
        interactions: [],
        validations: [],
        userPaths: [],
        errorScenarios: [],
        lastVisited: new Date()
      });
    }

    const page = this.pages.get(pageName);
    
    // Track all discovered elements
    screenData.elements.forEach(element => {
      const elementId = element.text || element.resourceId || element.contentDesc;
      if (elementId && !page.elements.has(elementId)) {
        page.elements.set(elementId, {
          ...element,
          tested: false,
          testScenarios: [],
          coverageLevel: 0
        });
      }
    });

    page.lastVisited = new Date();
  }

  trackGesture(gestureType, target, result) {
    const currentPage = this.getCurrentPage();
    if (!currentPage) return;

    // Mark element as tested
    if (currentPage.elements.has(target)) {
      const element = currentPage.elements.get(target);
      element.tested = true;
      element.testScenarios.push({
        type: gestureType,
        timestamp: new Date(),
        success: !result.content[0].text.includes('Error')
      });
      element.coverageLevel = Math.min(element.coverageLevel + 25, 100);
    }

    // Track interaction pattern
    currentPage.interactions.push({
      gesture: gestureType,
      target: target,
      timestamp: new Date(),
      success: !result.content[0].text.includes('Error')
    });
  }

  trackAction(action, element, result) {
    const currentPage = this.getCurrentPage();
    if (!currentPage) return;

    currentPage.interactions.push({
      action: action,
      element: element,
      timestamp: new Date(),
      success: !result.content[0].text.includes('Error')
    });
  }

  trackAuthFlow(flowType, success) {
    this.globalCoverage.userPaths.push({
      type: 'authentication',
      subType: flowType,
      success: success,
      timestamp: new Date()
    });
  }

  finalizePage(pageName) {
    const page = this.pages.get(pageName) || this.getCurrentPage();
    if (!page) throw new Error('No page data to finalize');

    const analysis = this.analyzePageCoverage(page);
    page.finalized = true;
    page.finalizedAt = new Date();
    
    return analysis;
  }

  analyzePageCoverage(page) {
    const totalElements = page.elements.size;
    const testedElements = Array.from(page.elements.values()).filter(e => e.tested).length;
    const coveragePercentage = totalElements > 0 ? Math.round((testedElements / totalElements) * 100) : 0;

    // Identify gaps
    const gaps = this.identifyGaps(page);
    
    // Generate suggestions
    const suggestions = this.generateSuggestions(page, gaps);
    
    // Risk assessment
    const risks = this.assessRisks(page, gaps);

    return {
      summary: {
        totalElements,
        testedElements,
        coveragePercentage,
        interactionCount: page.interactions.length
      },
      elementsFound: Array.from(page.elements.keys()),
      interactionsTested: page.interactions.map(i => i.action || i.gesture),
      gaps,
      suggestions,
      risks
    };
  }

  identifyGaps(page) {
    const gaps = {
      untestedElements: [],
      missingValidations: [],
      errorScenarios: [],
      accessibilityGaps: [],
      performanceGaps: []
    };

    // Untested elements
    page.elements.forEach((element, id) => {
      if (!element.tested) {
        gaps.untestedElements.push({
          element: id,
          type: element.isClickable ? 'interactive' : 'display',
          priority: element.isClickable ? 'high' : 'medium'
        });
      }
    });

    // Missing validations
    const inputElements = Array.from(page.elements.values())
      .filter(e => e.className && e.className.includes('EditText'));
    
    inputElements.forEach(element => {
      if (element.testScenarios.length < 3) {
        gaps.missingValidations.push({
          element: element.text || element.resourceId,
          missing: ['empty_input', 'invalid_format', 'boundary_values', 'malicious_input'],
          priority: 'high'
        });
      }
    });

    // Error scenarios
    if (page.interactions.every(i => i.success)) {
      gaps.errorScenarios.push({
        type: 'no_error_testing',
        scenarios: ['network_failure', 'server_error', 'invalid_data'],
        priority: 'medium'
      });
    }

    // Accessibility gaps
    gaps.accessibilityGaps.push({
      type: 'screen_reader',
      tests: ['element_announcements', 'navigation_flow', 'content_descriptions'],
      priority: 'medium'
    });

    return gaps;
  }

  generateSuggestions(page, gaps) {
    const suggestions = [];

    if (gaps.untestedElements.length > 0) {
      suggestions.push({
        category: 'Element Coverage',
        priority: 'high',
        description: `Test ${gaps.untestedElements.length} untested elements`,
        actions: gaps.untestedElements.map(g => `Test ${g.element} (${g.type})`)
      });
    }

    if (gaps.missingValidations.length > 0) {
      suggestions.push({
        category: 'Input Validation',
        priority: 'high', 
        description: 'Add comprehensive input validation tests',
        actions: [
          'Test empty field validation',
          'Test invalid format handling',
          'Test boundary value inputs',
          'Test security injection attempts'
        ]
      });
    }

    if (gaps.errorScenarios.length > 0) {
      suggestions.push({
        category: 'Error Handling',
        priority: 'medium',
        description: 'Test error scenarios and edge cases',
        actions: [
          'Test network connectivity issues',
          'Test server error responses', 
          'Test app backgrounding/foregrounding',
          'Test device rotation scenarios'
        ]
      });
    }

    return suggestions;
  }

  assessRisks(page, gaps) {
    const risks = [];

    const highPriorityGaps = [
      ...gaps.untestedElements.filter(g => g.priority === 'high'),
      ...gaps.missingValidations.filter(g => g.priority === 'high')
    ];

    if (highPriorityGaps.length > 0) {
      risks.push({
        level: 'high',
        category: 'functionality',
        description: `${highPriorityGaps.length} critical elements/validations not tested`,
        impact: 'Could cause production failures'
      });
    }

    if (gaps.errorScenarios.length > 0) {
      risks.push({
        level: 'medium', 
        category: 'reliability',
        description: 'No error scenario testing performed',
        impact: 'App may not handle failures gracefully'
      });
    }

    if (gaps.accessibilityGaps.length > 0) {
      risks.push({
        level: 'medium',
        category: 'compliance',
        description: 'Accessibility testing not performed',
        impact: 'Potential ADA compliance issues'
      });
    }

    return risks;
  }

  analyzeGaps(scope = 'current') {
    if (scope === 'current') {
      const currentPage = this.getCurrentPage();
      if (!currentPage) {
        return { error: 'No current page to analyze' };
      }
      return this.analyzePageCoverage(currentPage);
    }

    // Global analysis across all pages
    const allPages = Array.from(this.pages.values());
    const totalElements = allPages.reduce((sum, page) => sum + page.elements.size, 0);
    const totalTested = allPages.reduce((sum, page) => 
      sum + Array.from(page.elements.values()).filter(e => e.tested).length, 0);

    const overallCoverage = totalElements > 0 ? Math.round((totalTested / totalElements) * 100) : 0;

    // Aggregate gaps across all pages
    const criticalGaps = [];
    const mediumGaps = [];
    const lowPriorityGaps = [];

    allPages.forEach(page => {
      const analysis = this.analyzePageCoverage(page);
      analysis.gaps.untestedElements.forEach(gap => {
        if (gap.priority === 'high') criticalGaps.push(`${page.name}: ${gap.element}`);
        else mediumGaps.push(`${page.name}: ${gap.element}`);
      });
    });

    return {
      overallCoverage: `${overallCoverage}%`,
      criticalGaps,
      mediumGaps, 
      lowPriorityGaps,
      recommendations: this.generateGlobalRecommendations(allPages),
      nextActions: this.prioritizeNextActions(criticalGaps, mediumGaps)
    };
  }

  generateGlobalRecommendations(pages) {
    const recommendations = [];
    
    const untestedPages = pages.filter(p => !p.finalized);
    if (untestedPages.length > 0) {
      recommendations.push(`Complete testing for ${untestedPages.length} pages: ${untestedPages.map(p => p.name).join(', ')}`);
    }

    const lowCoveragePages = pages.filter(p => {
      const analysis = this.analyzePageCoverage(p);
      return analysis.summary.coveragePercentage < 70;
    });

    if (lowCoveragePages.length > 0) {
      recommendations.push(`Improve coverage for: ${lowCoveragePages.map(p => p.name).join(', ')}`);
    }

    return recommendations;
  }

  prioritizeNextActions(criticalGaps, mediumGaps) {
    const actions = [];
    
    if (criticalGaps.length > 0) {
      actions.push(`HIGH PRIORITY: Address ${criticalGaps.length} critical gaps`);
      actions.push(...criticalGaps.slice(0, 3).map(gap => `- Test ${gap}`));
    }

    if (mediumGaps.length > 0) {
      actions.push(`MEDIUM PRIORITY: Address ${mediumGaps.length} medium gaps`);
    }

    return actions;
  }

  getCurrentPage() {
    if (this.pages.size === 0) return null;
    
    // Return most recently visited page
    let mostRecent = null;
    let latestTime = 0;
    
    this.pages.forEach(page => {
      if (page.lastVisited.getTime() > latestTime) {
        latestTime = page.lastVisited.getTime();
        mostRecent = page;
      }
    });
    
    return mostRecent;
  }

  inferPageName(screenData) {
    // Simple page name inference based on elements
    if (screenData.auth_detected) return 'Login Page';
    if (screenData.elements.some(e => e.text?.toLowerCase().includes('dashboard'))) return 'Dashboard';
    if (screenData.elements.some(e => e.text?.toLowerCase().includes('settings'))) return 'Settings';
    if (screenData.elements.some(e => e.text?.toLowerCase().includes('profile'))) return 'Profile';
    
    return `Page_${Date.now()}`;
  }
}

module.exports = { CoverageAnalyzer };