Feature: Collection Commands

  @mappings
  Scenario: Export and import a collection
    Given an existing collection "nyc-open-data":"yellow-taxi"
    And I "create" the following documents:
      | _id               | body                              |
      | "chuon-chuon-kim" | { "city": "hcmc", "district": 1 } |
      | "the-hive"        | { "city": "hcmc", "district": 2 } |
    # collection:export
    When I run the command "collection:export" with args:
      | "nyc-open-data" |
      | "yellow-taxi"   |
    Then I successfully call the route "collection":"delete" with args:
      | index      | "nyc-open-data" |
      | collection | "yellow-taxi"   |
    # collection:import
    And I run the command "collection:import" with args:
      | "nyc-open-data/yellow-taxi" |
    Then The document "chuon-chuon-kim" content match:
      | city     | "hcmc" |
      | district | 1      |
    And The document "the-hive" content match:
      | city     | "hcmc" |
      | district | 2      |
    Then I successfully call the route "collection":"getMapping" with args:
      | index      | "nyc-open-data" |
      | collection | "yellow-taxi"   |
    And The property "properties" of the result should match:
      | city | { "type": "keyword" } |
      | name | { "type": "keyword" } |
