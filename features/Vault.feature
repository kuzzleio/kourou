Feature: Vault

  @vault
  Scenario: Encrypt a secrets file
    Given a JSON file "test-secrets.json" containing:
      | aws.s3   | "foobar" |
      | my.huong | "hcmc"   |
    When I run the command "vault:encrypt test-secrets.json" with flags:
      | --vault-key | "secret-password" |
    And I run the command "vault:show test-secrets.enc.json aws.s3" with flags:
      | --vault-key | "secret-password" |
    And I should match stdout with "foobar"
    And I run the command "vault:show test-secrets.enc.json my.huong" with flags:
      | --vault-key | "secret-password" |
    And I should match stdout with "hcmc"

  @vault
  Scenario: Add a key to an encrypted secrets file
    When I run the command "vault:add test-secrets.enc.json aws.s4 barfoo" with flags:
      | --vault-key | "secret-password" |
    And I run the command "vault:add test-secrets.enc.json aws.s3 foobar" with flags:
      | --vault-key | "secret-password" |
    Then I run the command "vault:show test-secrets.enc.json aws.s4" with flags:
      | --vault-key | "secret-password" |
    And I should match stdout with "barfoo"
    And I run the command "vault:show test-secrets.enc.json aws.s3" with flags:
      | --vault-key | "secret-password" |
    And I should match stdout with "foobar"

