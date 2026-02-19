@smoke @wikipedia @search @broken-demo
Feature: Wikipedia Search - BROKEN FOR DEMO
  Intentionally broken tests to demonstrate MCP debugging capabilities
  
  # This feature contains realistic bugs that can be fixed using MCP tools:
  # 1. Wrong element selectors
  # 2. Missing waits
  # 3. Incorrect assertions
  # 4. State management issues

  Background:
    Given the Wikipedia app is launched on Android 15.0
    And I have dismissed the version warning
    And I am on the Wikipedia main feed

  @critical @broken-selector
  Scenario: Search for an article - BROKEN SELECTOR
    Given I have opened the search view
    When I enter "Albert Einstein" in the search field
    # BUG: This step uses wrong assertion - should see results, not "no results"
    Then I should see "No results found" message

  @broken-element
  Scenario: Search with wrong element ID - BROKEN ELEMENT
    Given I have opened the search view
    # BUG: Uses non-existent element ID that will fail
    When I enter text into wrong search field
    Then I should see search suggestions

  @broken-state
  Scenario: Close search without opening - BROKEN STATE
    # BUG: Tries to close search view without opening it first
    When I tap the close button without opening search first
    Then I should return to the main feed
