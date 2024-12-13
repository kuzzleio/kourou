Feature: SDK commands

  @mappings
  Scenario: Send a query to Kuzzle
    Given an existing collection "nyc-open-data":"yellow-taxi"
    When I run the command "sdk:query" with:
      | arg  | document:createOrReplace |                        |
      | flag | --arg                    | index=nyc-open-data    |
      | flag | --arg                    | collection=yellow-taxi |
      | flag | -a                       | _id=chuon-chuon-kim    |
      | flag | --body                   | { "other-name": "my" } |
    Then The document "chuon-chuon-kim" content match:
      | other-name | "my" |

  @mappings
  Scenario: Execute code in the SDK context
    Given an existing collection "nyc-open-data":"yellow-taxi"
    When I run the command "sdk:execute" with:
      | arg | return await sdk.document.create("nyc-open-data", "yellow-taxi", {}, "document-adrien"); |
    Then The document "document-adrien" should exist
    And I should match stdout with "document-adrien"

  @mappings
  Scenario: Execute Typescript code in the SDK context
    Given an existing collection "nyc-open-data":"yellow-taxi"
    When I run the command "sdk:execute" with:
      | arg | const index: string = "nyc-open-data"; const collection: string = "yellow-taxi"; const id: string = "document-ricky"; return await sdk.document.create(index, collection, {}, id); |
    Then The document "document-ricky" should exist
    And I should match stdout with "document-ricky"

  @mappings
  Scenario: Impersonate an user
    Given an existing user "pandacrobate"
    When I run the command "sdk:query auth:getCurrentUser" with flags:
      | --as | "pandacrobate" |
    Then I should match stdout with:
      | "_id": "pandacrobate" |
