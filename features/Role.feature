Feature: Role Commands

  # role:export & role:import

  @security
  Scenario: Export and import roles
    Given I create a role "teacher" with the following API rights:
      | document | { "actions": { "create": true } } |
    And I create a role "student" with the following API rights:
      | document | { "actions": { "update": true } } |
    When I run the command "role:export" with:
      | flag | --path | ./dump |
    And I delete the role "teacher"
    And I delete the role "student"
    When I run the command "role:import" with:
      | arg | ./dump/roles.json |  |
    Then The role "teacher" should match:
      | document | { "actions": { "create": true } } |
    And The role "student" should match:
      | document | { "actions": { "update": true } } |


