Feature: Profile Commands

  # profile:dump & profile:restore
  @security
  Scenario: Dump and restore profiles
    Given I create a profile "teacher" with the following policies:
      | default | [] |
    And I create a profile "student" with the following policies:
      | default | [] |
