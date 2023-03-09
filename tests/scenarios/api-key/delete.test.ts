import { initContext, kourou } from "../../support";

describe("api-key:delete", () => {
  const context = initContext();

  it("should delete an api key when call api-key:delete command", async () => {
    // GIVEN
    const apiKeyCreated = await context.security.createApiKey(
      "gordon",
      "Test api key",
      {
        _id: "gordon-key",
        ttl: 1000,
      }
    );

    expect(apiKeyCreated._source.description).toBe("Test api key");
    expect(apiKeyCreated._source.userId).toBe("gordon");
    expect(apiKeyCreated._id).toBe("gordon-key");
    const gordonKey = await context.security.searchApiKeys("gordon");
    expect(gordonKey.hits).toHaveLength(1);

    // WHEN
    kourou("api-key:delete gordon gordon-key ");

    // THEN
    const apiKeys = await context.security.searchApiKeys("gordon");
    expect(apiKeys.hits).toHaveLength(0);
  });
});
