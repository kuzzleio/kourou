Feature: Profile Commands

  # profile:dump & profile:restore

  @security
  Scenario: Dump and restore profiles
    Given I create a profile "teacher" with the following policies:
      | default | [{ "index": "nyc-open-data" }] |
    And I create a profile "student" with the following policies:
      | admin | [{ "index": "mtp-open-data" }] |
    When I run the command "profile:dump" with:
      | flag | --path | ./dump |
    And I delete the profile "teacher"
    And I delete the profile "student"
    When I run the command "profile:restore" with:
      | arg | ./dump/profiles.json |  |
    Then The profile "teacher" should match:
      | default | [{ "index": "nyc-open-data" }] |
    And The profile "student" should match:
      | admin | [{ "index": "mtp-open-data" }] |


