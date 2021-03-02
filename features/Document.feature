Feature: Document Management

  # document:search ============================================================

  @mappings
  Scenario: Searches for documents
    Given an existing collection "nyc-open-data":"yellow-taxi"
    And I create the following document:
      | body | { "name": "Adrien", "city": "Saigon" } |
    And I create the following document:
      | body | { "name": "Sebastien", "city": "Cassis" } |
    And I refresh the collection
    When I run the command "document:search" with:
      | arg | nyc-open-data                  |
      | arg | yellow-taxi                    |
      | arg | { equals: { city: "Saigon" } } |
    Then I should match stdout with "Adrien"
    And I should not match stdout with "Sebastien"
