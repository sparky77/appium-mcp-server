@wikipedia @language-settings
Feature: Language Settings
  As a Wikipedia user
  I want to manage language settings
  So that I can read and search for content in my preferred language

  Background:
    Given the Wikipedia app is launched
    And I dismiss any initial dialogs

  # NOTE: Scenarios below are commented out — no step definitions exist yet
  # Uncomment when step defs are implemented in step-definitions/wikipedia/language-steps.js

  # @positive @language-change
  # Scenario: Navigate to language settings
  #   When I tap the more options button
  #   And I tap the Settings menu item
  #   And I tap the Language option
  #   Then I should see the language list screen
  #   And I should see "Wikipedia languages" as the title

  # @positive @language-change
  # Scenario: View available languages in settings
  #   When I navigate to language settings
  #   Then I should see a list of available languages
  #   And I should see "English" in the language list
  #   And I should see "Español" in the language list
  #   And I should see "Français" in the language list
  #   And the current language should be marked as selected

  # @positive @language-change
  # Scenario: Change app display language to Spanish
  #   When I navigate to language settings
  #   And I select "Español" from the language list
  #   And I confirm the language change
  #   Then the app language should be Spanish
  #   And the main screen title should be in Spanish

  # @positive @language-search
  # Scenario: Search for a specific language
  #   When I navigate to language settings
  #   And I tap the search languages field
  #   And I enter "German" into the language search
  #   Then I should see "Deutsch" in the filtered results
  #   And other languages should be hidden

  # @positive @language-order
  # Scenario: Verify language list alphabetical order
  #   When I navigate to language settings
  #   Then the language list should be sorted alphabetically
  #   And the current language should appear at the top

  # @negative @language-search
  # Scenario: Search for non-existent language
  #   When I navigate to language settings
  #   And I tap the search languages field
  #   And I enter "Klingon" into the language search
  #   Then I should see "No results found" message
  #   And the language list should be empty

  # @negative @language-validation
  # Scenario: Cancel language change
  #   When I navigate to language settings
  #   And I select "Français" from the language list
  #   And I tap the back button before confirming
  #   Then the app language should remain English
  #   And the main screen should not change

  # @edge-case @language-persistence
  # Scenario: Verify language persists after app restart
  #   When I navigate to language settings
  #   And I change the language to "Español"
  #   And I close and relaunch the app
  #   Then the app language should still be Spanish
  #   And the main screen should display in Spanish

  # @accessibility @language-settings
  # Scenario: Verify language selection accessibility
  #   When I navigate to language settings
  #   Then each language item should have content description
  #   And the search field should be accessible to screen readers
  #   And the selected language should have proper state announcement

  # LEGACY BROKEN TESTS FOR DEMO
  @broken @demo
  Scenario: Change app language to Spanish - BROKEN DEMO
    Given the Wikipedia app is launched
    And I dismiss any dialogs
    When I tap the menu button
    And I navigate to language settings
    And I select "Español" from the language list
    Then the app language should be "Español"
    And the main feed should show Spanish content

  @broken @demo  
  Scenario: Verify unsupported language handling - BROKEN DEMO
    Given the Wikipedia app is launched
    When I attempt to select an unsupported language "Klingon"
    Then an error message should be displayed
    And the language should remain as "English"
