Feature: Profile Commands

  # export:profile

  @security
  Scenario: Export profiles
    Given I create a profile "teacher" with the following policies:
      | default | [{ "index": "nyc-open-data" }] |
    And I create a profile "student" with the following policies:
      | admin | [{ "index": "mtp-open-data" }] |
    When I run the command "export:profile" with:
      | flag | --path | ./dump |

