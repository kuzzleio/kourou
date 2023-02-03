import {initContext, kourou} from "../../support";

describe("api-key:create", () => {

  const context = initContext();

  afterEach(async () => {
    await context.security.deleteApiKey("gordon", "gordon-key");
  });

  it("should create an api key when call api-key:create command", async () => {
    // WHEN
    kourou("api-key:create gordon \"Test api key\" --id gordon-key ");

    // THEN
    const apiKeys = await context.security.searchApiKeys("gordon");
    const apiKey = apiKeys.hits;
    expect(apiKey).toHaveLength(1);

    const source = apiKey[0]._source;
    expect(source.description).toBe("Test api key");
    expect(source.userId).toBe("gordon");
    expect(source.ttl).toBe(-1);
    expect(source.expiresAt).toBe(-1);
    expect(apiKey[0]._id).toEqual("gordon-key");
  });
});
