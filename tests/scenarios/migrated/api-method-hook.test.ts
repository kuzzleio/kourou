import { useSdk } from "../../helpers/sdk";
import { beforeEachTruncateCollections } from "../../hooks/collections";
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

describe("ApiMethodHook", () => {
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
  it("Unregistered API method", async () => {
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
      const { stdout } = await kourou("document:createOrReplace", [
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

  it("Infer common arguments", async () => {
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
      const { stdout } = await kourou("collection:list", "nyc-open-data", []);
      response = stdout;
    } catch (error) {
      console.error(error);
      throw error;
    }

    expect(response).toMatch(new RegExp("yellow-taxi"));

    try {
      const { stdout } = await kourou(
        "collection:truncate",
        "nyc-open-data",
        "yellow-taxi",
        []
      );
      response = stdout;
    } catch (error) {
      console.error(error);
      throw error;
    }

    expect(response).toMatch(new RegExp("acknowledged"));

    try {
      const { stdout } = await kourou(
        "document:createOrReplace",
        "nyc-open-data",
        "yellow-taxi",
        "foobar-1",
        "{helloWorld: 42}",
        []
      );
      response = stdout;
    } catch (error) {
      console.error(error);
      throw error;
    }

    expect(response).toMatch(new RegExp("helloWorld"));

    try {
      const { stdout } = await kourou(
        "document:delete",
        "nyc-open-data",
        "yellow-taxi",
        "foobar-1",
        []
      );
      response = stdout;
    } catch (error) {
      console.error(error);
      throw error;
    }

    expect(response).toMatch(new RegExp("foobar-1"));

    try {
      const { stdout } = await kourou(
        "collection:updateMapping",
        "nyc-open-data",
        "yellow-taxi",
        '{ dynamic: "false" }',
        []
      );
      response = stdout;
    } catch (error) {
      console.error(error);
      throw error;
    }

    expect(response).toMatch(new RegExp("false"));
  });
});