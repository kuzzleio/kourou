Feature: Elasticsearch commands

  @mappings
  Scenario: Get a document
    Given an existing collection "nyc-open-data":"yellow-taxi"
    And I create the following document:
      | _id  | "chuon-chuon-kim" |
      | body | {}                |
    When I run the command "es:indices:get" with args:
      | "&nyc-open-data.yellow-taxi" |
      | "chuon-chuon-kim"            |
    Then I should match stdout with "chuon-chuon-kim"

  @mappings
  Scenario: List ES indexes
    Given a collection "nyc-open-data":"green-taxi"
    When I run the command "es:indices:list" with flags:
      | --grep | "nyc-open-data" |
    Then I should match stdout with "yellow-taxi"
    And I should match stdout with "green-taxi"

  @mappings
  Scenario: Insert ES document
    Given a collection "nyc-open-data":"green-taxi"
    When I run the command "es:indices:insert" with:
      | arg  | &nyc-open-data.yellow-taxi |         |
      | flag | --id                       | kindred |
      | flag | --body                     | {}      |
    When I run the command "es:indices:get" with args:
      | "&nyc-open-data.yellow-taxi" |
      | "kindred"                    |
    Then I should match stdout with "kindred"
