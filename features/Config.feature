Feature: Config

  # config:key-diff ================================================================

  Scenario: Config key-diff
    When I run the command "config:key-diff" with:
      | arg | features/fixtures/kuzzlerc1 |
      | arg | features/fixtures/kuzzlerc2 |
    Then I should match stdout with "was removed"
