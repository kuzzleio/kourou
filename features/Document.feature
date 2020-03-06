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