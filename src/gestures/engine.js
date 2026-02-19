class GestureEngine {
  async execute(driver, { type, target, params = {} }) {
    const element = await this.resolveTarget(driver, target);
    
    switch (type) {
      case 'tap':
        return await this.tap(driver, element, target);
      case 'scroll':
        return await this.scroll(driver, params.direction || target || 'down');
      case 'long_press':
        return await this.longPress(driver, element, params.duration || 2000);
      case 'back':
        return await this.back(driver);
      default:
        throw new Error(`Unknown gesture: ${type}`);
    }
  }

  async resolveTarget(driver, target) {
    // Enhanced element finding with multiple strategies
    const strategies = [
      () => driver.$(`//*[@text="${target}"]`),  // Exact match first
      () => driver.$(`//*[contains(@text, "${target}")]`),
      () => driver.$(`//*[@content-desc="${target}"]`),
      () => driver.$(`//*[contains(@content-desc, "${target}")]`),
      () => driver.$(`//*[contains(@resource-id, "${target}")]`),
      () => driver.$(`android=new UiSelector().textContains("${target}")`),  // UiAutomator2
      () => driver.$(`android=new UiSelector().descriptionContains("${target}")`) // UiAutomator2
    ];

    for (const strategy of strategies) {
      try {
        const element = await strategy();
        if (await element.isExisting()) {
          // Wait for element to be displayed and stable
          await element.waitForDisplayed({ timeout: 5000 });
          return element;
        }
      } catch (e) { /* continue */ }
    }
    return null;
  }

  async tap(driver, element, targetDesc) {
    if (element) {
      // Wait for element to be clickable
      await element.waitForEnabled({ timeout: 5000 });
      
      // Get page state before action
      const beforeState = await this.getPageState(driver);
      
      await element.click();
      
      // Wait for page to stabilize after tap
      await driver.pause(1000);
      await this.waitForPageLoad(driver);
      
      // Get page state after action
      const afterState = await this.getPageState(driver);
      const navigationOccurred = beforeState !== afterState;
      
      return { 
        content: [{ 
          type: "text", 
          text: JSON.stringify({
            action: "tap",
            target: targetDesc,
            navigationOccurred,
            beforePage: beforeState,
            afterPage: afterState
          }, null, 2)
        }] 
      };
    }
    throw new Error("Element not found for tap");
  }

  async waitForPageLoad(driver) {
    // Wait for any loading indicators to disappear
    try {
      const loadingIndicators = [
        'android=new UiSelector().textContains("Loading")',
        'android=new UiSelector().descriptionContains("Loading")',
        '//*[contains(@text, "Loading")]',
        '//*[contains(@content-desc, "Loading")]'
      ];

      for (const selector of loadingIndicators) {
        try {
          const loader = await driver.$(selector);
          if (await loader.isExisting()) {
            await loader.waitForDisplayed({ timeout: 10000, reverse: true });
          }
        } catch (e) { /* continue */ }
      }
    } catch (e) { /* No loaders found */ }
    
    // Additional stabilization wait
    await driver.pause(500);
  }

  async getPageState(driver) {
    // Get unique page identifier from visible elements
    try {
      const pageSource = await driver.getPageSource();
      const elements = await driver.$$('//*[@text!="" or @content-desc!=""]');
      
      const pageSignature = [];
      for (let i = 0; i < Math.min(5, elements.length); i++) {
        try {
          const text = await elements[i].getText().catch(() => '');
          const desc = await elements[i].getAttribute('content-desc').catch(() => '');
          if (text || desc) pageSignature.push(text || desc);
        } catch (e) { /* continue */ }
      }
      
      return pageSignature.join('|') || 'unknown';
    } catch (e) {
      return 'unknown';
    }
  }

  async scroll(driver, direction) {
    const windowSize = await driver.getWindowSize();
    const centerX = Math.round(windowSize.width / 2);
    const centerY = Math.round(windowSize.height / 2);
    const width = Math.round(windowSize.width * 0.8);
    const height = Math.round(windowSize.height * 0.6);
    const left = Math.round((windowSize.width - width) / 2);
    const top = Math.round((windowSize.height - height) / 2);

    await driver.execute('mobile: scrollGesture', {
      left,
      top,
      width,
      height,
      direction,
      percent: 0.7
    });

    return { content: [{ type: "text", text: `Scrolled ${direction}` }] };
  }

  async longPress(driver, element, duration) {
    if (element) {
      const location = await element.getLocation();
      const size = await element.getSize();
      const x = Math.round(location.x + size.width / 2);
      const y = Math.round(location.y + size.height / 2);

      await driver.execute('mobile: longClickGesture', {
        x,
        y,
        duration
      });

      return { content: [{ type: "text", text: `Long pressed for ${duration}ms` }] };
    }
    throw new Error("Element not found for long press");
  }

  async back(driver) {
    // Get page state before back action
    const beforeState = await this.getPageState(driver);
    
    // Android back button
    await driver.back();
    
    // Wait for navigation to complete
    await driver.pause(1000);
    await this.waitForPageLoad(driver);
    
    // Get page state after action
    const afterState = await this.getPageState(driver);
    
    return { 
      content: [{ 
        type: "text", 
        text: JSON.stringify({
          action: "back",
          navigationOccurred: beforeState !== afterState,
          beforePage: beforeState,
          afterPage: afterState
        }, null, 2)
      }] 
    };
  }
}

module.exports = { GestureEngine };