class ScreenAnalyzer {
  async analyze(driver) {
    // Detect context first
    let contexts = [];
    let currentContext = 'NATIVE_APP';
    try {
      contexts = await driver.getContexts();
      currentContext = await driver.getContext();
    } catch (e) {
      // If contexts aren't available yet, assume native
    }
    const isWebView = currentContext.includes('WEBVIEW');
    
    let elements = [];
    
    if (isWebView) {
      // Analyze web elements in Firebase auth
      elements = await this.analyzeWebElements(driver);
    } else {
      // Analyze native Flutter elements
      elements = await this.analyzeNativeElements(driver);
    }

    // Identify current page
    const pageIdentity = await this.identifyPage(driver, elements);

    return {
      content: [{
        type: "text", 
        text: JSON.stringify({
          context: isWebView ? 'webview' : 'native',
          available_contexts: contexts,
          current_page: pageIdentity.name,
          page_signature: pageIdentity.signature,
          elements: elements,
          clickable_count: elements.filter(e => e.isClickable).length,
          auth_detected: this.detectFirebaseAuth(elements),
          suggestions: this.suggestActions(elements, isWebView)
        }, null, 2)
      }]
    };
  }

  async identifyPage(driver, elements) {
    // Extract unique text/labels to identify the page
    const pageTexts = elements
      .filter(e => e.text && e.text.trim())
      .map(e => e.text.trim())
      .slice(0, 10);

    const signature = pageTexts.join('|');
    
    // Identify page based on key elements
    let pageName = 'Unknown';
    
    if (signature.includes('Login')) pageName = 'Login Page';
    else if (signature.includes('Change Environment')) pageName = 'Login/Environment Page';
    else if (signature.includes('staging') || signature.includes('dev8') || signature.includes('prod')) {
      pageName = 'Environment Selection';
    }
    else if (signature.includes('Email') || signature.includes('Password')) pageName = 'Auth Form';
    else if (signature.includes('Home') || signature.includes('Dashboard')) pageName = 'Home';
    
    return {
      name: pageName,
      signature: signature.substring(0, 100), // First 100 chars
      timestamp: new Date().toISOString()
    };
  }

  async analyzeWebElements(driver) {
    const webElements = await driver.$$('*');
    const visibleElements = [];

    for (const element of webElements.slice(0, 15)) {
      try {
        if (await element.isDisplayed()) {
          const tagName = await element.getTagName();
          const text = await element.getText().catch(() => '');
          const id = await element.getAttribute('id').catch(() => '');
          const type = await element.getAttribute('type').catch(() => '');
          
          visibleElements.push({
            tagName,
            text: text || id,
            id,
            type,
            isClickable: tagName === 'button' || tagName === 'a' || type === 'submit'
          });
        }
      } catch (e) { /* skip */ }
    }
    
    return visibleElements;
  }

  async analyzeNativeElements(driver) {
    const elements = await driver.$$('*');
    const visibleElements = [];

    for (const element of elements.slice(0, 15)) {
      try {
        if (await element.isDisplayed()) {
          const text = await element.getText().catch(() => '');
          const resourceId = await element.getAttribute('resource-id').catch(() => '');
          const contentDesc = await element.getAttribute('content-desc').catch(() => '');
          
          visibleElements.push({
            text: text || contentDesc || resourceId,
            resourceId,
            contentDesc,
            isClickable: await element.isClickable().catch(() => false)
          });
        }
      } catch (e) { /* skip */ }
    }
    
    return visibleElements;
  }

  detectFirebaseAuth(elements) {
    const authKeywords = ['email', 'password', 'sign in', 'login', 'firebase'];
    return elements.some(el => 
      authKeywords.some(keyword => 
        el.text?.toLowerCase().includes(keyword) || 
        el.id?.toLowerCase().includes(keyword)
      )
    );
  }

  findElementByDescription(analysis, description) {
    const data = JSON.parse(analysis.content[0].text);
    return data.elements.find(el => 
      el.text?.toLowerCase().includes(description.toLowerCase())
    )?.text;
  }

  suggestActions(elements, isWebView) {
    if (isWebView && this.detectFirebaseAuth(elements)) {
      return ['use handle_firebase_auth tool with email and password'];
    }
    
    return elements
      .filter(el => el.isClickable && el.text)
      .slice(0, 3)
      .map(el => `tap ${el.text}`);
  }
}

module.exports = { ScreenAnalyzer };