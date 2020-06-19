Feature: User Commands

  # user:export & user:import ==================================================

  @security
  Scenario: Export and import users
    Given I create a user "kleiner" with content:
      | profileIds | ["admin"]              |
      | email      | "kleiner@blackmesa.us" |
    And I create a user "alyx" with content:
      | profileIds | ["admin"]           |
      | email      | "alyx@blackmesa.us" |
    When I run the command "user:export" with:
      | flag | --path    | ./dump     |
      | flag | --exclude | gordon     |
      | flag | --exclude | test-admin |
    And I delete the user "kleiner"
    And I delete the user "alyx"
    When I run the command "user:import" with:
      | arg | ./dump/users.json |  |
    Then The user "kleiner" should match:
      | profileIds | ["admin"]              |
      | email      | "kleiner@blackmesa.us" |
    And The user "alyx" should match:
      | profileIds | ["admin"]           |
      | email      | "alyx@blackmesa.us" |


