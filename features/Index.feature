Feature: Index Commands

  @mappings
  Scenario: Export an index
    Given an existing collection "nyc-open-data":"yellow-taxi"
    And I "create" the following documents:
      | _id               | body                              |
      | "chuon-chuon-kim" | { "city": "hcmc", "district": 1 } |
      | "the-hive"        | { "city": "hcmc", "district": 2 } |
    And I refresh the collection
    And a collection "nyc-open-data":"green-taxi"
    And I "create" the following documents:
      | _id                | body                              |
      | "chuon-chuon-kim2" | { "city": "hcmc", "district": 1 } |
      | "the-hive2"        | { "city": "hcmc", "district": 2 } |
    And I refresh the collection
    # index:export
    When I run the command "export:index" with args:
      | "nyc-open-data" |
    And I successfully call the route "index":"delete" with args:
      | index | "nyc-open-data" |
