Feature: Api Key Management

  @security
  Scenario: Create an API Key
    When I run the command "api-key:create" with:
      | --user        | "gordon"       |
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
    When I run the command "api-key:delete" with:
      | --user | "gordon"     |
      | --id   | "gordon-key" |
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
      | --user   | "gordon" |
      | --filter | "Test"   |
    Then I should match stdout with "gordon-key"
    And I should not match stdout with "gordon-key-2"
