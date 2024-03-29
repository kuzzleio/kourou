Feature: Collection Commands

  # collection:export & collection:import ======================================

  @mappings
  Scenario: Export and import a collection
    Given an existing collection "nyc-open-data":"yellow-taxi"
    And I "create" the following documents:
      | _id               | body                                  |
      | "chuon-chuon-kim" | { "city": "hcmc", "district": 1 }     |
      | "the-hive-vn"     | { "city": "hcmc", "district": 2 }     |
      | "the-hive-th"     | { "city": "changmai", "district": 7 } |
    And I refresh the collection
    # collection:export
    When I run the command "collection:export" with:
      | arg  | nyc-open-data |                            |
      | arg  | yellow-taxi   |                            |
      | flag | --query       | { term: { city: "hcmc" } } |
      | flag | --scrollTTL   | 3s                         |
    Then I successfully call the route "collection":"delete" with args:
      | index      | "nyc-open-data" |
      | collection | "yellow-taxi"   |
    # collection:import
    And I run the command "collection:import" with args:
      | "nyc-open-data/yellow-taxi" |
    Then The document "chuon-chuon-kim" content match:
      | city     | "hcmc" |
      | district | 1      |
    And The document "the-hive-vn" content match:
      | city     | "hcmc" |
      | district | 2      |
    And The document "the-hive-th" should not exists
    Then I successfully call the route "collection":"getMapping" with args:
      | index      | "nyc-open-data" |
      | collection | "yellow-taxi"   |
    And The property "properties" of the result should match:
      | city | { "type": "keyword" } |
      | name | { "type": "keyword" } |

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

  # collection:migrate ======================================

  @mappings
  Scenario: Migrate a collection
    Given an existing collection "nyc-open-data":"yellow-taxi"
    Given I "create" the following documents:
      | _id       | body                             |
      | "antoine" | { "name": "Antoine Ducuroy" }    |
      | "karina"  | { "name": "Karina Tsimashenka" } |
    Given I refresh the collection
    Given I run the command "collection:export" with:
      | arg | nyc-open-data |  |
      | arg | yellow-taxi   |  |
    Given I successfully call the route "collection":"truncate" with args:
      | index      | "nyc-open-data" |
      | collection | "yellow-taxi"   |
    # migrate
    When I run the command "collection:migrate" with args:
      | "./features/fixtures/migration.js" |
      | "./nyc-open-data/yellow-taxi"      |
    Then The document "antoine" content match:
      | firstName | "Antoine" |
      | lastName  | "Ducuroy" |
    Then The document "karina" content match:
      | firstName | "Karina"      |
      | lastName  | "Tsimashenka" |
