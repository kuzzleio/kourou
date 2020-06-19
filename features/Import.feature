Feature: Generic Import

  @mappings
  @security
  Scenario: Generic import of dump files
    # index export
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
    And I run the command "index:export" with:
      | arg  | nyc-open-data |        |
      | flag | --path        | ./dump |
    And I successfully call the route "index":"delete" with args:
      | index | "nyc-open-data" |

    # profile export
    And I create a profile "teacher" with the following policies:
      | default | [{ "index": "nyc-open-data" }] |
    And I create a profile "student" with the following policies:
      | admin | [{ "index": "mtp-open-data" }] |
    And I run the command "profile:export" with:
      | flag | --path | ./dump |
    And I delete the profile "teacher"
    And I delete the profile "student"

    # role export
    And I create a role "teacher" with the following API rights:
      | document | { "actions": { "create": true } } |
    And I create a role "student" with the following API rights:
      | document | { "actions": { "update": true } } |
    When I run the command "role:export" with:
      | flag | --path | ./dump |
    And I delete the role "teacher"
    And I delete the role "student"

    # user export
    And I create a user "kleiner" with content:
      | profileIds | ["admin"]              |
      | email      | "kleiner@blackmesa.us" |
    And I create a user "alyx" with content:
      | profileIds | ["admin"]           |
      | email      | "alyx@blackmesa.us" |
    When I run the command "user:export" with:
      | flag | --path    | ./dump     |
      | flag | --exclude | gordon     |
      | flag | --exclude | test-admin |
    And I delete the user "kleiner"
    And I delete the user "alyx"


    # import
    And I run the command "import" with:
      | arg | ./dump |  |

    # Check index & collections import
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

    # Check role import
    Then The role "teacher" should match:
      | document | { "actions": { "create": true } } |
    And The role "student" should match:
      | document | { "actions": { "update": true } } |

    # Check profile import
    Then The profile "teacher" should match:
      | default | [{ "index": "nyc-open-data" }] |
    And The profile "student" should match:
      | admin | [{ "index": "mtp-open-data" }] |

    # Check user import
    Then The user "kleiner" should match:
      | profileIds | ["admin"]              |
      | email      | "kleiner@blackmesa.us" |
    And The user "alyx" should match:
      | profileIds | ["admin"]           |
      | email      | "alyx@blackmesa.us" |
