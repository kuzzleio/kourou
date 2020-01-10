Feature: Instance logs

  Scenario: Show logs of specified kuzzle instance
    When I run the command "instance:logs" with:
      | --instance | "kuzzle" |
    Then I should match stdout with "Kuzzle server 2.[0-9]+.[0-9]+ ready"
