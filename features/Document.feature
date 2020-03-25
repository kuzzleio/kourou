Feature: Document Management

  # document:create ============================================================

  @mappings
  Scenario: Creates a document
    Given an existing collection "nyc-open-data":"yellow-taxi"
    When I run the command "document:create" with:
      | arg  | nyc-open-data |                  |
      | arg  | yellow-taxi   |                  |
      | flag | --id          | chuon-chuon-kim  |
      | flag | --body        | { "my": "name" } |
    Then The document "chuon-chuon-kim" content match:
      | my | "name" |
    When I run the command "document:create" with:
      | arg  | nyc-open-data |                        |
      | arg  | yellow-taxi   |                        |
      | flag | --id          | chuon-chuon-kim        |
      | flag | --body        | { "my": "other name" } |
      | flag | --replace     |                        |
    Then The document "chuon-chuon-kim" content match:
      | my | "other name" |

  # document:get ===============================================================

  @mappings
  Scenario: Gets a document
    Given an existing collection "nyc-open-data":"yellow-taxi"
    And I create the following document:
      | _id  | "chuon-chuon-kim" |
      | body | {}                |
    When I run the command "document:get" with args:
      | "nyc-open-data"   |
      | "yellow-taxi"     |
      | "chuon-chuon-kim" |
    Then I should match stdout with "chuon-chuon-kim"

  # document:search ============================================================

  @mappings
  Scenario: Searches for documents
    Given an existing collection "nyc-open-data":"yellow-taxi"
    And I create the following document:
      | body | { "name": "Adrien", "city": "Saigon" } |
    And I create the following document:
      | body | { "name": "Sebastien", "city": "Cassis" } |
    And I refresh the collection
    When I run the command "document:search" with:
      | arg  | nyc-open-data |                              |
      | arg  | yellow-taxi   |                              |
      | flag | --query       | { term: { city: "Saigon" } } |
    Then I should match stdout with "Adrien"
    And I should not match stdout with "Sebastien"
