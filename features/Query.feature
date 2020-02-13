Feature: Query

  Scenario: Send a query to Kuzzle
    When I run the command "query" with args:
      | "server:now" |
    Then I should match stdout with "now"
