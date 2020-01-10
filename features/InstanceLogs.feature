Feature: Instance logs

  Scenario: Show logs of specified kuzzle instance
    When I run the command "instance:logs" with:
      | --instance | "docker_kuzzle_1" |
    Then I should match stdout with "Kuzzle server 2.0.3 ready"
