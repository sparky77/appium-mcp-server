Feature: Language Settings (Demo: Broken Test)
  As a Wikipedia user
  I want to change language settings
  So that I can read articles in my preferred language

  @broken @demo
  Scenario: Change app language to Spanish
    Given the Wikipedia app is launched
    And I dismiss any dialogs
    When I tap the menu button
    And I navigate to language settings
    And I select "Español" from the language list
    Then the app language should be "Español"
    And the main feed should show Spanish content

  @broken @demo  
  Scenario: Verify unsupported language handling
    Given the Wikipedia app is launched
    When I attempt to select an unsupported language "Klingon"
    Then an error message should be displayed
    And the language should remain as "English"
