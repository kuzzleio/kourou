Feature: Api Key Management

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
      | flag | --query | "Test" |
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
