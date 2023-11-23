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

  Scenario: Impersonate an user
    When I run the command "sdk:query" with:
      | arg  | auth:getCurrentUser |        |
      | flag | --as                | gordon |
    Then I should match stdout with:
      | "_id": "gordon" |

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
      | arg | return const index: string = "nyc-open-data"; const collection: string = "yellow-taxi"; const id: string = "document-ricky"; await sdk.document.create(index, collection, {}, id); |
    Then The document "document-ricky" should exist
    And I should match stdout with "document-ricky"
