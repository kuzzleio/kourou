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
    When I run the command "es:snapshots:create-repository" with:
      | arg  | backup         |           |
      | arg  | /tmp/snapshots |           |
      | flag | --host         | localhost |
      | flag | --port         | 9200      |
      | flag | --compress     |           |
    Then I should match stdout with "Success"

  Scenario: Dump ES data to a snapshot into a repository
    When I run the command "es:snapshots:create" with:
      | arg  | backup        |           |
      | arg  | test-snapshot |           |
      | flag | --host        | localhost |
      | flag | --port        | 9200      |
    Then I should match stdout with "Success"

  Scenario: List all available snapshots of a repository
    When I run the command "es:snapshots:list" with:
      | arg  | backup |           |
      | flag | --host | localhost |
      | flag | --port | 9200      |
    Then I should match stdout with "test-snapshot"

  Scenario: Sucessfully Restore a snapshot into a running ES instance
    When I run the command "es:snapshots:restore" with:
      | arg  | backup        |           |
      | arg  | test-snapshot |           |
      | flag | --host        | localhost |
      | flag | --port        | 9200      |
    Then I should match stdout with "Success"
