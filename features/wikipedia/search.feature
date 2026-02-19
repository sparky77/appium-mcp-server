@smoke @wikipedia @search
Feature: Wikipedia Search
  Test Wikipedia search functionality

  Background:
    Given the Wikipedia app is launched on Android 15.0
    And I have dismissed the version warning
    And I am on the Wikipedia main feed

  @critical
  Scenario: Open search view
    When I tap the search container
    Then the search view should open
    And I should see the search input field
    And I should see "Wikipedia language" selector
    And I should see "EN" language displayed

  @critical
  Scenario: Close search view
    Given I have opened the search view
    When I tap the close button
    Then I should return to the main feed
    And I should see the search container

  Scenario: Search for an article
    Given I have opened the search view
    When I enter "Abraham Lincoln" in the search field
    Then I should see search suggestions
    When I tap the first search result
    Then I should navigate to the article page

  Scenario: Search with no results
    Given I have opened the search view
    When I enter "xyzabc123nonexistent" in the search field
    Then I should see "No results found" message
