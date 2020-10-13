Feature: Query hook arguments infering

  Scenario: Infer <command> <index>
    When I run the command "index:create" with:
      | arg | nyc-open-data |
    And I successfully call the route "index":"list"
    Then I should receive a "indexes" array matching:
      | "nyc-open-data" |

  @security
  Scenario: Infer <command> <body>
    When I run the command "security:createUser" with:
      | arg  | {"content":{"profileIds":["default"]}} |        |
      | flag | --id                                   | yagmur |
    Then I successfully call the route "security":"getUser" with args:
      | _id | "yagmur" |

  @mappings
  Scenario: Infer <command> <index> <collection>
    Given an existing collection "nyc-open-data":"yellow-taxi"
    When I run the command "collection:exists" with:
      | arg | nyc-open-data |  |
      | arg | yellow-taxi   |  |
    Then I should match stdout with "true"

  @mappings
  Scenario: Infer <command> <index> <collection> <body>
    When I run the command "collection:update" with:
      | arg | nyc-open-data                      |  |
      | arg | yellow-taxi                        |  |
      | arg | { mappings: { dynamic: "false" } } |  |
    And I successfully call the route "collection":"getMapping" with args:
      | index      | "nyc-open-data" |
      | collection | "yellow-taxi"   |
    Then I should receive a result matching:
      | dynamic | "false" |

  @mappings
  Scenario: Infer <command> <index> <collection> <_id>
    Given an existing collection "nyc-open-data":"yellow-taxi"
    And I successfully call the route "document":"create" with args:
      | index      | "nyc-open-data" |
      | collection | "yellow-taxi"   |
      | _id        | "yagmur"        |
    When I run the command "document:get" with:
      | arg | nyc-open-data |
      | arg | yellow-taxi   |
      | arg | yagmur        |
    Then I should match stdout with "yagmur"

  @mappings
  Scenario: Infer <command> <index> <collection> <_id> <body>
    Given an existing collection "nyc-open-data":"yellow-taxi"
    When I run the command "document:createOrReplace" with:
      | arg | nyc-open-data         |
      | arg | yellow-taxi           |
      | arg | yagmur                |
      | arg | { "city": "Antalya" } |
    Then I successfully call the route "document":"get" with args:
      | index      | "nyc-open-data" |
      | collection | "yellow-taxi"   |
      | _id        | "yagmur"        |
    And I should receive a result matching:
      | _source.city | "Antalya" |

