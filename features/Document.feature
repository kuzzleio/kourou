Feature: Document Management

  @mappings
  Scenario: Get a document
    Given an existing collection "nyc-open-data":"yellow-taxi"
    And I create the following document:
      | _id  | "chuon-chuon-kim" |
      | body | {}                |
    When I run the command "document:get" with args:
      | "nyc-open-data"   |
      | "yellow-taxi"     |
      | "chuon-chuon-kim" |
    Then I should match stdout with "chuon-chuon-kim"
