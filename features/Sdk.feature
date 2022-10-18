Feature: SDK commands

  # api ==================================================================

  @mappings
  Scenario: Send a query to Kuzzle
    Given an existing collection "nyc-open-data":"yellow-taxi"
    When I run the command "api" with:
      | arg  | document:createOrReplace |                        |
      | flag | --arg                    | index=nyc-open-data    |
      | flag | --arg                    | collection=yellow-taxi |
      | flag | -a                       | _id=chuon-chuon-kim    |
      | flag | --body                   | { "other-name": "my" } |
    Then The document "chuon-chuon-kim" content match:
      | other-name | "my" |

  Scenario: Impersonate an user
    When I run the command "api" with:
      | arg  | auth:getCurrentUser |        |
      | flag | --as                | gordon |
    Then I should match stdout with:
      | "_id": "gordon" |

  # execute ================================================================

  @mappings
  Scenario: Execute code in the SDK context
    Given an existing collection "nyc-open-data":"yellow-taxi"
    When I run the command "execute" with:
      | arg | return await sdk.document.create("nyc-open-data", "yellow-taxi", {}, "document-adrien"); |
    Then The document "document-adrien" should exist
    And I should match stdout with "document-adrien"
