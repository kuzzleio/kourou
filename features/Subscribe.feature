Feature: Subscribe Command

  # subscribe ==================================================================

  @realtime @mappings
  Scenario: Subscribe to notifications
    Given an existing collection "nyc-open-data":"yellow-taxi"
    When I subscribe to "nyc-open-data":"yellow-taxi"
    And I create the following document:
      | _id  | "chuon-chuon-kim" |
      | body | {}                |
    And I kill the CLI process
    Then I should match stdout with "chuon-chuon-kim"

