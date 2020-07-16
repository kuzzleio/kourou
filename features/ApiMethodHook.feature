Feature: Hooks

  # command_not_found hook =====================================================

  @mappings
  Scenario: Unregistered API method
    Given an existing collection "nyc-open-data":"yellow-taxi"
    When I run the command "document:createOrReplace" with:
      | flag | --arg  | index=nyc-open-data    |
      | flag | --arg  | collection=yellow-taxi |
      | flag | -a     | _id=chuon-chuon-kim    |
      | flag | --body | { "other-name": "my" } |
    Then The document "chuon-chuon-kim" content match:
      | other-name | "my" |

  @mappings
  Scenario: Infer common arguments
    Given an existing collection "nyc-open-data":"yellow-taxi"
    # <command> <index>
    When I run the command "collection:list" with:
      | arg | nyc-open-data |  |
    Then I should match stdout with "yellow-taxi"
    # <command> <index> <collection>
    When I run the command "collection:truncate" with:
      | arg | nyc-open-data |  |
      | arg | yellow-taxi   |  |
    Then I should match stdout with "acknowledged"
    # <command> <index> <collection> <id> <body>
    When I run the command "document:createOrReplace" with:
      | arg | nyc-open-data    |  |
      | arg | yellow-taxi      |  |
      | arg | foobar-1         |  |
      | arg | {helloWorld: 42} |  |
    Then I should match stdout with "helloWorld"
    # <command> <index> <collection> <id>
    When I run the command "document:delete" with:
      | arg | nyc-open-data |  |
      | arg | yellow-taxi   |  |
      | arg | foobar-1      |  |
    Then I should match stdout with "foobar-1"
    # <command> <index> <collection> <body>
    When I run the command "collection:updateMapping" with:
      | arg | nyc-open-data        |  |
      | arg | yellow-taxi          |  |
      | arg | { dynamic: "false" } |  |
    Then I should match stdout with "false"

