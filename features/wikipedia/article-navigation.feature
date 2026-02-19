@smoke @wikipedia  
Feature: Wikipedia Article Navigation
  Test Wikipedia article viewing and navigation

  Background:
    Given the Wikipedia app is launched on Android 15.0
    And I have dismissed the version warning
    And I am on the Wikipedia main feed

  @critical
  Scenario: View featured article
    When I tap the "Featured article" card
    Then I should navigate to an article page
    And the article content should load

  Scenario: Handle article load error
    Given I am viewing an article
    When the article fails to load
    Then I should see "An error occurred" message
    And I should see "GO BACK" button
    When I tap the "GO BACK" button
    Then I should return to the previous screen

  Scenario: Article actions available
    Given I am viewing an article successfully
    Then I should see "Add this article to a reading list" button
    And I should see "Share the article link" button
    And I should see "Change language" option
