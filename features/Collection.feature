Feature: Collection Commands

  @mappings
  Scenario: Dump and restore a collection
    Given an existing collection "nyc-open-data":"yellow-taxi"
    And I "create" the following documents:
      | _id               | body                              |
      | "chuon-chuon-kim" | { "city": "hcmc", "district": 1 } |
      | "the-hive"        | { "city": "hcmc", "district": 2 } |
    When I run the command "collection:dump" with args:
      | "nyc-open-data" |
      | "yellow-taxi"   |
    And I truncate the collection "nyc-open-data":"yellow-taxi"
    And I run the command "collection:restore" with args:
      | "nyc-open-data/collection-yellow-taxi.jsonl" |
    Then The document "chuon-chuon-kim" content match:
      | city     | "hcmc" |
      | district | 1      |
    And The document "the-hive" content match:
      | city     | "hcmc" |
      | district | 2      |

