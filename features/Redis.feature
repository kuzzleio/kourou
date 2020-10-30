Feature: Redis commands

  # redis:list-keys ============================================================

  Scenario: List matching keys
    Given I successfully call the route "ms":"set" with args:
      | _id  | "trekking-1"        |
      | body | { "value": "caner"} |
    And I successfully call the route "ms":"set" with args:
      | _id  | "trekking-2"        |
      | body | { "value": "burak"} |
    And I successfully call the route "ms":"set" with args:
      | _id  | "hiking-1"          |
      | body | { "value": "ozgur"} |
    When I run the command "redis:list-keys" with:
      | arg | trekking-* |
    Then I should match stdout with "caner"
    And I should match stdout with "burak"
    And I should not match stdout with "ozgur"

  Scenario: List and delete matching keys
    Given I successfully call the route "ms":"set" with args:
      | _id  | "trekking-1"        |
      | body | { "value": "caner"} |
    And I successfully call the route "ms":"set" with args:
      | _id  | "trekking-2"        |
      | body | { "value": "burak"} |
    And I successfully call the route "ms":"set" with args:
      | _id  | "hiking-1"          |
      | body | { "value": "ozgur"} |
    And I run the command "redis:list-keys" with:
      | arg  | trekking-* |
      | flag | --remove   |
    When I run the command "redis:list-keys" with:
      | arg | * |
    Then I should not match stdout with "caner"
    And I should not match stdout with "burak"
    And I should match stdout with "ozgur"