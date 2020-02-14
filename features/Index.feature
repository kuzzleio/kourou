Feature: Index Commands

  @mappings
  Scenario: Dump and restore an index
    Given an existing collection "nyc-open-data":"yellow-taxi"
    And I "create" the following documents:
      | _id               | body                              |
      | "chuon-chuon-kim" | { "city": "hcmc", "district": 1 } |
      | "the-hive"        | { "city": "hcmc", "district": 2 } |
    And a collection "nyc-open-data":"green-taxi"
    And I "create" the following documents:
      | _id                | body                              |
      | "chuon-chuon-kim2" | { "city": "hcmc", "district": 1 } |
      | "the-hive2"        | { "city": "hcmc", "district": 2 } |
    # index:dump
    When I run the command "index:dump" with args:
      | "nyc-open-data" |
    And I successfully call the route "index":"delete" with args:
      | index | "nyc-open-data" |
    # index:restore
    And I run the command "index:restore" with args:
      | "nyc-open-data" |
    Then The document "chuon-chuon-kim2" content match:
      | city     | "hcmc" |
      | district | 1      |
    And The document "the-hive2" content match:
      | city     | "hcmc" |
      | district | 2      |
    And an existing collection "nyc-open-data":"yellow-taxi"
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

