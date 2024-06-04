Feature: Instance logs

  Scenario: Show logs of specified kuzzle instance
    When I run the command "instance:logs" with flags:
      | --instance | "kuzzle" |
    Then I should match stdout with "Kuzzle 2.[0-9]+.[0-9]+(-\w+.[0-9]+)? is ready"
