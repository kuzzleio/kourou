Feature: Config

  # config:diff ================================================================

  Scenario: Config diff
    When I run the command "config:diff" with:
      | arg | features/fixtures/kuzzlerc1 |
      | arg | features/fixtures/kuzzlerc2 |
    Then I should match stdout with "was removed"
