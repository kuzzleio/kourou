Feature: Api Key Management

  @security
  Scenario: Create an API Key
    When I run the command "api-key:create gordon" with flags:
      | --description | "Test api key" |
      | --id          | "gordon-key"   |
    Then I successfully call the route "security":"searchApiKeys" with args:
      | userId | "gordon" |
    And I should receive a "hits" array of objects matching:
      | _id          | _source.description | _source.userId |
      | "gordon-key" | "Test api key"      | "gordon"       |

  @security
  Scenario: Delete an API Key
    Given I successfully call the route "security":"createApiKey" with args:
      | _id              | "gordon-key"   |
      | userId           | "gordon"       |
      | body.description | "Test api key" |
    When I run the command "api-key:delete gordon" with:
      | arg | gordon-key |
    Then I successfully call the route "security":"searchApiKeys" with args:
      | userId | "gordon" |
    And I should receive a empty "hits" array

  @security
  Scenario: Search for API key
    Given I successfully call the route "security":"createApiKey" with args:
      | _id              | "gordon-key"   |
      | userId           | "gordon"       |
      | body.description | "Test api key" |
    And I successfully call the route "security":"createApiKey" with args:
      | _id              | "gordon-key-2"  |
      | userId           | "gordon"        |
      | body.description | "Other api key" |
    When I run the command "api-key:search" with:
      | arg  | gordon   |        |
      | flag | --filter | "Test" |
    Then I should match stdout with "gordon-key"
    And I should not match stdout with "gordon-key-2"

  @security
  Scenario: Checks an API Key validity
    Given I create an API key
    When I check the API key validity
    Then I should match stdout with "API key is still valid"

  @security
  Scenario: Use an API Key to connect
    Given I create an API key
    Then I should get the correct current user with the given api-key
