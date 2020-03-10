Feature: Role Commands

  # role:dump & role:restore

  @security
  Scenario: Dump and restore roles
    Given I create a role "teacher" with the following API rights:
      | document | { "actions": { "create": true } } |
    And I create a role "student" with the following API rights:
      | document | { "actions": { "update": true } } |
    When I run the command "role:dump" with:
      | flag | --path | ./dump |
    And I delete the role "teacher"
    And I delete the role "student"
    When I run the command "role:restore" with:
      | arg | ./dump/roles.json |  |
    Then The role "teacher" should match:
      | document | { "actions": { "create": true } } |
    And The role "student" should match:
      | document | { "actions": { "update": true } } |


