@smoke @wikipedia
Feature: Wikipedia App Launch
  Test Wikipedia app startup and initial screen loading

  Background:
    Given the Wikipedia app is launched on Android 15.0

  @critical @dialog-test
  Scenario: Dismiss version warning with OK button
    When the version warning dialog appears
    Then I should see "Wikipedia Alpha" title
    And I should see "OK" button
    And I should see "Check for update" button
    When I tap the "OK" button
    Then I should be on the Wikipedia main feed

  @critical @dialog-test
  Scenario: Check for update from version warning
    When the version warning dialog appears
    Then I should see "Wikipedia Alpha" title
    And I should see "Check for update" button
    When I tap the "Check for update" button
    Then the app should attempt to open the Play Store

  @critical
  Scenario: Main feed loads successfully
    Given I have dismissed the version warning
    When I am on the Wikipedia main feed
    Then I should see the search container
    And I should see "Featured article" section
    And I should see today's date displayed
