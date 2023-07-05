Feature: Role Commands

  # export:role

  @security
  Scenario: Export and import roles
    Given I create a role "teacher" with the following API rights:
      | document | { "actions": { "create": true } } |
    And I create a role "student" with the following API rights:
      | document | { "actions": { "update": true } } |
    When I run the command "role:export" with:
      | flag | --path | ./dump |


