class FeatureGenerator {
  generateFeatures(coverageAnalyzer, pageName, includeGaps = true) {
    if (pageName === 'all') {
      return this.generateAllPageFeatures(coverageAnalyzer, includeGaps);
    }
    
    const page = pageName ? 
      coverageAnalyzer.pages.get(pageName) : 
      coverageAnalyzer.getCurrentPage();
      
    if (!page) {
      return "No page data available for feature generation";
    }

    return this.generatePageFeature(page, coverageAnalyzer, includeGaps);
  }

  generatePageFeature(page, coverageAnalyzer, includeGaps) {
    const analysis = coverageAnalyzer.analyzePageCoverage(page);
    
    let feature = `Feature: ${page.name} Testing
  As a user
  I want to interact with the ${page.name}
  So that I can complete my tasks successfully

  Background:
    Given I am on the "${page.name}"

`;

    // Generate element validation scenarios
    feature += this.generateElementValidationScenarios(page);
    
    // Generate interaction scenarios
    feature += this.generateInteractionScenarios(page);
    
    // Generate gap-based scenarios if requested
    if (includeGaps && analysis.gaps) {
      feature += this.generateGapScenarios(analysis.gaps, page.name);
    }

    return feature;
  }

  generateElementValidationScenarios(page) {
    const interactiveElements = Array.from(page.elements.values())
      .filter(e => e.isClickable);
    
    let scenarios = `  Scenario: Page Elements Validation
    Then I should see all required elements on the page\n`;
    
    interactiveElements.forEach(element => {
      const elementName = element.text || element.resourceId || element.contentDesc;
      scenarios += `    And I should see "${elementName}" element\n`;
    });

    scenarios += `    And all interactive elements should be clickable\n\n`;
    
    return scenarios;
  }

  generateInteractionScenarios(page) {
    let scenarios = '';
    
    // Group interactions by type
    const uniqueInteractions = new Map();
    page.interactions.forEach(interaction => {
      const key = interaction.action || interaction.gesture;
      if (!uniqueInteractions.has(key)) {
        uniqueInteractions.set(key, interaction);
      }
    });

    uniqueInteractions.forEach((interaction, key) => {
      const target = interaction.target || interaction.element || 'element';
      scenarios += `  Scenario: ${this.formatScenarioName(key)}
    When I ${key.toLowerCase()} "${target}"
    Then the action should complete successfully
    And I should see appropriate feedback

`;
    });

    return scenarios;
  }

  generateGapScenarios(gaps, pageName) {
    let scenarios = `  # Gap-based scenarios for improved coverage\n\n`;

    // Untested elements scenarios
    if (gaps.untestedElements.length > 0) {
      scenarios += `  Scenario: Test Untested Elements
    Given I am on the "${pageName}"
`;
      gaps.untestedElements.forEach(gap => {
        scenarios += `    When I interact with "${gap.element}"
    Then the element should respond appropriately
`;
      });
      scenarios += '\n';
    }

    // Input validation scenarios
    if (gaps.missingValidations.length > 0) {
      scenarios += `  Scenario Outline: Input Field Validation
    Given I am on the "${pageName}"
    When I enter "<input_value>" in "<field_name>"
    And I submit the form
    Then I should see "<expected_result>"

    Examples:
      | field_name | input_value | expected_result |
`;
      gaps.missingValidations.forEach(validation => {
        scenarios += `      | ${validation.element} | "" | validation error |\n`;
        scenarios += `      | ${validation.element} | invalid_format | format error |\n`;
        scenarios += `      | ${validation.element} | <script>alert('xss')</script> | security error |\n`;
      });
      scenarios += '\n';
    }

    // Error scenarios
    if (gaps.errorScenarios.length > 0) {
      scenarios += `  Scenario: Error Handling
    Given I am on the "${pageName}"
    When a network error occurs
    Then I should see appropriate error message
    And I should be able to retry the action

  Scenario: Offline Behavior  
    Given I am on the "${pageName}"
    When the device goes offline
    Then the page should handle offline state gracefully
    And data should be preserved when connection returns

`;
    }

    return scenarios;
  }

  generateAllPageFeatures(coverageAnalyzer, includeGaps) {
    let allFeatures = '';
    
    coverageAnalyzer.pages.forEach(page => {
      allFeatures += this.generatePageFeature(page, coverageAnalyzer, includeGaps);
      allFeatures += '\n' + '='.repeat(50) + '\n\n';
    });

    return allFeatures;
  }

  formatScenarioName(action) {
    return action.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
}

module.exports = { FeatureGenerator };