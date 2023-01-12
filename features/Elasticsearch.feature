Feature: Elasticsearch commands

  @mappings
  Scenario: Get a document
    Given an existing collection "nyc-open-data":"yellow-taxi"
    And I create the following document:
      | _id  | "chuon-chuon-kim" |
      | body | {}                |
    When I run the command "es:indices:get" with args:
      | "&nyc-open-data.yellow-taxi" |
      | "chuon-chuon-kim"            |
    Then I should match stdout with "chuon-chuon-kim"

  @mappings
  Scenario: Cat ES indexes
    Given a collection "nyc-open-data":"green-taxi"
    When I run the command "es:indices:cat" with flags:
      | --grep | "nyc-open-data" |
    Then I should match stdout with "yellow-taxi"
    And I should match stdout with "green-taxi"

  @mappings
  Scenario: Cat ES aliases
    Given a collection "nyc-open-data":"green-taxi"
    When I run the command "es:aliases:cat" with flags:
      | --grep | "users" |
    Then I should match stdout with "{"index": "%plugin-kuzzle-plugin-auth-passport-local.users", "alias": "@%plugin-kuzzle-plugin-auth-passport-local.users"}"
    Then I should match stdout with "{"index": "%kuzzle.users", "alias": "@%kuzzle.users"}"

  @mappings
  Scenario: Insert ES document
    Given a collection "nyc-open-data":"green-taxi"
    When I run the command "es:indices:insert" with:
      | arg  | &nyc-open-data.yellow-taxi |         |
      | flag | --id                       | kindred |
      | flag | --body                     | {}      |
    When I run the command "es:indices:get" with args:
      | "&nyc-open-data.yellow-taxi" |
      | "kindred"                    |
    Then I should match stdout with "kindred"

  Scenario: Create a snapshot repository
    When I run the command "es:snapshot:create-repository" with:
      | arg  | backup         |  |
      | arg  | /tmp/snapshots |  |
      | flag | --compress     |  |
    Then I should match stdout with "Success"

  Scenario: Dump ES data to a snapshot into a repository
    When I run the command "es:snapshot:create" with:
      | arg | backup        |  |
      | arg | test-snapshot |  |
    Then I should match stdout with "Success"

  Scenario: List all available snapshot of a repository
    When I run the command "es:snapshot:list" with:
      | arg | backup |  |
    Then I should match stdout with "test-snapshot"

  Scenario: Dump and restore ES data to a dump folder using the pattern option
    Given an index "nyc-open-data"
    Given a collection "nyc-open-data":"yellow-taxi"
    Then I create the following document:
      | _id  | "chuon-chuon-kim"                 |
      | body | { "city": "hcmc", "district": 1 } |
    Then I create the following document:
      | _id  | "the-hive-vn"                     |
      | body | { "city": "hcmc", "district": 2 } |
    Then I create the following document:
      | _id  | "the-hive-th"                         |
      | body | { "city": "changmai", "district": 7 } |
    Then I count 3 documents
    Then I run the command "es:migrate" with:
      | flag | --src  | http://localhost:9200 |
      | flag | --dest | ./kourou-dump         |
    Then I should have 3 lines in file "./kourou-dump/&nyc-open-data.yellow-taxi.json"
    Then I run the command "es:migrate" with:
      | flag | --src            | ./kourou-dump         |
      | flag | --dest           | http://localhost:9200 |
      | flag | --reset          |                       |
      | flag | --no-interactive |                       |
    Given an existing collection "nyc-open-data":"yellow-taxi"
    Then I refresh the collection
    And I count 3 documents
