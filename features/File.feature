Feature: File

  # file:encrypt, file:decrypt =================================================

  @vault
  Scenario: Encrypt and decrypt a file
    Given a JSON file "test-secrets.json" containing:
      | aws.s3   | "foobar" |
      | my.huong | "hcmc"   |
    When I run the command "file:encrypt" with:
      | arg  | test-secrets.json |                 |
      | flag | --vault-key       | secret-password |
    And I run the command "file:decrypt" with:
      | arg  | test-secrets.json.enc |                 |
      | flag | --output-file         | decrypted.json  |
      | flag | --vault-key           | secret-password |
    Then The file "decrypted.json" content should match:
      | aws.s3   | "foobar" |
      | my.huong | "hcmc"   |

  # file:test ==================================================================

  @vault
  Scenario: Test a file
    Given a JSON file "test-secrets.json" containing:
      | aws.s3   | "foobar" |
      | my.huong | "hcmc"   |
    And I run the command "file:encrypt" with:
      | arg  | test-secrets.json |                 |
      | flag | --vault-key       | secret-password |
    When I run the command "file:test" with:
      | arg  | test-secrets.json.enc |                 |
      | flag | --vault-key           | secret-password |
    Then I should match stdout with "Encrypted file can be decrypted"