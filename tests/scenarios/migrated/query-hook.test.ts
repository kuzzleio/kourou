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

describe("QueryHook", () => {
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
  it("Infer <command> <index>", async () => {
    shouldResetSecurity = false;

    let index;
    let collection;
    let document;
    let response;

    try {
      const { stdout } = await kourou("index:create", "nyc-open-data", []);
      response = stdout;
    } catch (error) {
      console.error(error);
      throw error;
    }

    response = await sdk.query({ controller: "index", action: "list" });

    expect(response.result["indexes"].length).toBe(1);
    expect(response.result["indexes"].sort()).toBe(["nyc-open-data"].sort());
  });

  it("Infer <command> <body>", async () => {
    shouldResetSecurity = true;

    let index;
    let collection;
    let document;
    let response;

    try {
      const { stdout } = await kourou(
        "security:createUser",
        '{"content":{"profileIds":["default"]}}',
        ["--id", "yagmur"]
      );
      response = stdout;
    } catch (error) {
      console.error(error);
      throw error;
    }

    response = await sdk.query({
      controller: "security",
      action: "getUser",
      _id: "yagmur",
    });
  });

  it("Infer <command> <index> <collection>", async () => {
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
        "collection:exists",
        "nyc-open-data",
        "yellow-taxi",
        []
      );
      response = stdout;
    } catch (error) {
      console.error(error);
      throw error;
    }

    expect(response).toMatch(new RegExp("true"));
  });

  it("Infer <command> <index> <collection> <body>", async () => {
    shouldResetSecurity = false;

    let index;
    let collection;
    let document;
    let response;

    try {
      const { stdout } = await kourou(
        "collection:update",
        "nyc-open-data",
        "yellow-taxi",
        '{ mappings: { dynamic: "false" } }',
        []
      );
      response = stdout;
    } catch (error) {
      console.error(error);
      throw error;
    }

    response = await sdk.query({
      controller: "collection",
      action: "getMapping",
      index: "nyc-open-data",
      collection: "yellow-taxi",
    });

    expect(response.result).toMatchObject({ dynamic: "false" });
  });

  it("Infer <command> <index> <collection> <_id>", async () => {
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

    response = await sdk.query({
      controller: "document",
      action: "create",
      index: "nyc-open-data",
      collection: "yellow-taxi",
      _id: "yagmur",
    });

    try {
      const { stdout } = await kourou(
        "document:get",
        "nyc-open-data",
        "yellow-taxi",
        "yagmur",
        []
      );
      response = stdout;
    } catch (error) {
      console.error(error);
      throw error;
    }

    expect(response).toMatch(new RegExp("yagmur"));
  });

  it("Infer <command> <index> <collection> <_id> <body>", async () => {
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
        "document:createOrReplace",
        "nyc-open-data",
        "yellow-taxi",
        "yagmur",
        '{ "city": "Antalya" }',
        []
      );
      response = stdout;
    } catch (error) {
      console.error(error);
      throw error;
    }

    response = await sdk.query({
      controller: "document",
      action: "get",
      index: "nyc-open-data",
      collection: "yellow-taxi",
      _id: "yagmur",
    });

    expect(response.result).toMatchObject({ _source: { city: "Antalya" } });
  });
});
