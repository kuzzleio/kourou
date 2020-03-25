Feature: Vault

  @vault
  Scenario: Encrypt a secrets file
    Given a JSON file "test-secrets.json" containing:
      | aws.s3   | "foobar" |
      | my.huong | "hcmc"   |
    When I run the command "vault:encrypt" with:
      | arg  | test-secrets.json |                   |
      | flag | --vault-key       | "secret-password" |
    And I run the command "vault:show" with:
      | arg  | test-secrets.enc.json |                   |
      | arg  | aws.s3                |                   |
      | flag | --vault-key           | "secret-password" |
    And I should match stdout with "foobar"
    And I run the command "vault:show" with:
      | arg  | test-secrets.enc.json |                   |
      | arg  | my.huong              |                   |
      | flag | --vault-key           | "secret-password" |
    And I should match stdout with "hcmc"

  @vault
  Scenario: Add a key to an encrypted secrets file
    When I run the command "vault:add" with:
      | arg  | test-secrets.enc.json |                   |
      | arg  | aws.s4                |                   |
      | arg  | barfoo                |                   |
      | flag | --vault-key           | "secret-password" |
    And I run the command "vault:add" with:
      | arg  | test-secrets.enc.json |                   |
      | arg  | aws.s3                |                   |
      | arg  | foobar                |                   |
      | flag | --vault-key           | "secret-password" |
    Then I run the command "vault:show" with:
      | arg  | test-secrets.enc.json |                   |
      | arg  | aws.s4                |                   |
      | flag | --vault-key           | "secret-password" |
    And I should match stdout with "barfoo"
    And I run the command "vault:show" with:
      | arg  | test-secrets.enc.json |                   |
      | arg  | aws.s3                |                   |
      | flag | --vault-key           | "secret-password" |
    And I should match stdout with "foobar"

  @vault
  Scenario: Encrypt a secrets file
    Given a JSON file "test-secrets.json" containing:
      | aws.s3   | "foobar" |
      | my.huong | "hcmc"   |
    And I run the command "vault:encrypt" with:
      | arg  | test-secrets.json |                   |
      | flag | --vault-key       | "secret-password" |
    When I run the command "vault:test" with:
      | arg  | test-secrets.enc.json |                   |
      | flag | --vault-key           | "secret-password" |
