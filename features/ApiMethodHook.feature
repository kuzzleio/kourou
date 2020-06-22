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
