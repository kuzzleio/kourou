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

  # user:export-mapping & user:import-mapping ==================================================

  @security
  Scenario: Export and import users mappings
    Given I create an "user-mapping.json" file with content:
      | email      | {"type": "keyword"} |
      | age        | {"type": "integer"}  |
    When I run the command "user:import-mapping" with:
      | arg | ./dump/user-mapping.json |
    Then I successfully call the route "security":"getUserMapping"
    And The property "mapping" of the result should match:
      | profileIds | {"type": "keyword"} |
      | email | { "type": "keyword" }    |
      | age   | { "type": "integer" }     |
    When I run the command "user:export-mapping" with:
      | flag | --path    | ./dump     |
    Then The file "./dump/users-mappings.json" content should match:
      | type    | "usersMappings"                                                                                                    |
      | content | { "mapping": { "age": { "type": "integer" }, "email": { "type": "keyword"}, "profileIds": { "type": "keyword"} } } |
