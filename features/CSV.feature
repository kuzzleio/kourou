Feature: CSV Export

  @mappings
  Scenario: Exports a collection to CSV specifying the fields
    Given an existing collection "nyc-open-data":"yellow-taxi"
    And I "create" the following documents:
      | _id               | body                                                                             |
      | "chuon-chuon-kim" | { "city": "hcmc", "district": 1, "nested": {"field": 1} }                        |
      | "the-hive-vn"     | { "city": "hcmc", "district": 2, "nested": {"field": 2} }                        |
      | "the-hive-th"     | { "city": "changmai", "district": 7, "unwanted": "field" }                       |
      | "luca"            | { "city": "changmai", "district": [7, 8, 9] }                                    |
      | "toto"            | { "city": "changmai", "district": 11, "object": {"field": "this is an object"} } |

    And I refresh the collection
    # export:collection
    When I run the command "export:collection" with:
      | arg  | nyc-open-data |                                   |
      | arg  | yellow-taxi   |                                   |
      | flag | --format      | csv                               |
      | flag | --fields      | city,district,nested.field,object |
    Then I get the file in "nyc-open-data/yellow-taxi/documents.csv" containing
      """
      _id,city,district,nested.field,object
      chuon-chuon-kim,hcmc,1,1,
      the-hive-vn,hcmc,2,2,
      the-hive-th,changmai,7,,
      luca,changmai,[NOT_SCALAR],,
      toto,changmai,11,,[NOT_SCALAR]

      """

  @mappings
  Scenario: Exports a collection to CSV without specifying any field
    Given an existing collection "nyc-open-data":"yellow-taxi"
    And I "create" the following documents:
      | _id               | body                                                       |
      | "the-hive-th"     | { "city": "changmai", "district": 7, "unwanted": "field" } |
      | "luca"            | { "city": "changmai", "district": [7, 8, 9] }              |
      | "chuon-chuon-kim" | { "city": "hcmc", "district": 1, "nested": {"field": 1} }  |
    And I refresh the collection
    # export:collection
    When I run the command "export:collection" with:
      | arg  | nyc-open-data |     |
      | arg  | yellow-taxi   |     |
      | flag | --format      | csv |
    Then I get the file in "nyc-open-data/yellow-taxi/documents.csv" containing
      """
      _id,city,city.type,name,name.type
      the-hive-th,changmai,,,
      luca,changmai,,,
      chuon-chuon-kim,hcmc,,,

      """
