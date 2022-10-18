Feature: Collection Commands

  # export:collection ======================================

  @mappings
  Scenario: Export a collection
    Given an existing collection "nyc-open-data":"yellow-taxi"
    And I "create" the following documents:
      | _id               | body                                  |
      | "chuon-chuon-kim" | { "city": "hcmc", "district": 1 }     |
      | "the-hive-vn"     | { "city": "hcmc", "district": 2 }     |
      | "the-hive-th"     | { "city": "changmai", "district": 7 } |
    And I refresh the collection
    # collection:export
    When I run the command "export:collection" with:
      | arg  | nyc-open-data |                            |
      | arg  | yellow-taxi   |                            |
      | flag | --query       | { term: { city: "hcmc" } } |
      | flag | --scrollTTL   | 3s                         |
    Then I successfully call the route "collection":"delete" with args:
      | index      | "nyc-open-data" |
      | collection | "yellow-taxi"   |

  # collection:create ==========================================================

  Scenario: Creates a collection
    When I run the command "collection:create" with:
      | arg | mtp-open-data                      |  |
      | arg | yellow-taxi                        |  |
      | arg | { mappings: { dynamic: "false" } } |  |
    And I successfully call the route "collection":"getMapping" with args:
      | index      | "mtp-open-data" |
      | collection | "yellow-taxi"   |
    Then I should receive a result matching:
      | dynamic | "false" |
