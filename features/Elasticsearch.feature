Feature: Elasticsearch commands

  @mappings
  Scenario: Get a document
    Given an existing collection "nyc-open-data":"yellow-taxi"
    And I create the following document:
      | _id  | "chuon-chuon-kim" |
      | body | {}                |
    When I run the command "es:get" with args:
      | "&nyc-open-data.yellow-taxi" |
      | "chuon-chuon-kim "           |
    Then I should match stdout with "chuon-chuon-kim"

  @mappings
  Scenario: List ES indexes
    Given a collection "nyc-open-data":"green-taxi"
    When I run the command "es:list-index" with flags:
      | --grep | "nyc-open-data" |
    Then I should match stdout with "yellow-taxi"
    And I should match stdout with "green-taxi"
