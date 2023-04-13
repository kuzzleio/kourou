import { useSdk } from "../../helpers/sdk";
import { beforeEachTruncateCollections } from "../../hooks/collections";
import { beforeEachLoadFixtures } from "../../hooks/fixtures";
import { resetSecurityDefault } from "../../hooks/securities";

import { Client } from "@elastic/elasticsearch";
import { execute } from "../../../lib/support/execute";
import fs from "fs";
import { exec } from "child_process";

jest.setTimeout(20000);

function kourou(...command: any[]) {
  const kourouRuntime = process.env.KOUROU_RUNTIME || "./bin/run";
  return execute(kourouRuntime, ...command);
}

describe("Sdk", () => {
  let sdk = useSdk();
  let shouldResetSecurity = false;
  let shouldLogout = false;
  let esClient = new Client({
    node: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
  });

  beforeAll(async () => {
    await sdk.connect();
  });

  beforeEach(async () => {
    await beforeEachTruncateCollections(sdk);
    await beforeEachLoadFixtures(sdk);
  });

  afterEach(async () => {
    if (shouldResetSecurity) {
      await resetSecurityDefault(sdk);
      shouldResetSecurity = false;
    }

    if (shouldLogout) {
      sdk.jwt = null;
    }
  });

  afterAll(async () => {
    sdk.disconnect();
  });
  it("Send a query to Kuzzle", async () => {
    shouldResetSecurity = false;

    let index;
    let collection;
    let document;
    let response;

    await expect(sdk.index.exists("nyc-open-data")).resolves.toBe(true);
    index = "nyc-open-data";

    await expect(
      sdk.collection.exists("nyc-open-data", "yellow-taxi")
    ).resolves.toBe(true);
    collection = "yellow-taxi";

    try {
      const { stdout } = await kourou("api", "document:createOrReplace", [
        "--arg",
        "index=nyc-open-data",
        "--arg",
        "collection=yellow-taxi",
        "-a",
        "_id=chuon-chuon-kim",
        "--body",
        '{ "other-name": "my" }',
      ]);
      response = stdout;
    } catch (error) {
      console.error(error);
      throw error;
    }

    await expect(
      sdk.document.get(index, collection, "chuon-chuon-kim")
    ).resolves.toMatchObject({ _source: { "other-name": "my" } });
  });

  it("Impersonate an user", async () => {
    shouldResetSecurity = false;

    let index;
    let collection;
    let document;
    let response;

    try {
      const { stdout } = await kourou("api", "auth:getCurrentUser", [
        "--as",
        "gordon",
      ]);
      response = stdout;
    } catch (error) {
      console.error(error);
      throw error;
    }

    expect(response).toMatch(new RegExp('"_id": "gordon"'));
  });

  it("Execute code in the SDK context", async () => {
    shouldResetSecurity = false;

    let index;
    let collection;
    let document;
    let response;

    await expect(sdk.index.exists("nyc-open-data")).resolves.toBe(true);
    index = "nyc-open-data";

    await expect(
      sdk.collection.exists("nyc-open-data", "yellow-taxi")
    ).resolves.toBe(true);
    collection = "yellow-taxi";

    try {
      const { stdout } = await kourou(
        "execute",
        'return await sdk.document.create("nyc-open-data", "yellow-taxi", {}, "document-adrien");',
        []
      );
      response = stdout;
    } catch (error) {
      console.error(error);
      throw error;
    }

    await expect(
      sdk.document.exists(index, collection, "document-adrien")
    ).resolves.toBe(true);

    expect(response).toMatch(new RegExp("document-adrien"));
  });
});
