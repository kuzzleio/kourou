Feature: SDK commands

  # sdk:query ==================================================================

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

  # sdk:execute ================================================================

  @mappings
  Scenario: Execute code in the SDK context
    Given an existing collection "nyc-open-data":"yellow-taxi"
    When I run the command "sdk:execute" with:
      | flag | --code | return await sdk.document.create("nyc-open-data", "yellow-taxi", { name: "Adrien" }, "document-adrien"); |
    Then The document "document-adrien" content match:
      | name | "Adrien" |
    And I should match stdout with "document-adrien"