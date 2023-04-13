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

describe("Elasticsearch", () => {
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
  it("Get a document", async () => {
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

    await sdk.document.create(index, collection, {}, "chuon-chuon-kim");

    try {
      const { stdout } = await kourou(
        "es:indices:get",
        "&nyc-open-data.yellow-taxi",
        "chuon-chuon-kim"
      );
      response = stdout;
    } catch (error) {
      console.error(error);
      throw error;
    }

    expect(response).toMatch(new RegExp("chuon-chuon-kim"));
  });

  it("Cat ES indexes", async () => {
    shouldResetSecurity = false;

    let index;
    let collection;
    let document;
    let response;

    await sdk.collection.create("nyc-open-data", "green-taxi", {
      mappings: {},
    });
    index = "nyc-open-data";
    collection = "green-taxi";

    try {
      const { stdout } = await kourou(
        "es:indices:cat",
        "--grep",
        "nyc-open-data"
      );
      response = stdout;
    } catch (error) {
      console.error(error);
      throw error;
    }

    expect(response).toMatch(new RegExp("yellow-taxi"));

    expect(response).toMatch(new RegExp("green-taxi"));
  });

  it("Cat ES aliases", async () => {
    shouldResetSecurity = false;

    let index;
    let collection;
    let document;
    let response;

    await sdk.collection.create("nyc-open-data", "green-taxi", {
      mappings: {},
    });
    index = "nyc-open-data";
    collection = "green-taxi";

    try {
      const { stdout } = await kourou("es:aliases:cat", "--grep", "users");
      response = stdout;
    } catch (error) {
      console.error(error);
      throw error;
    }

    expect(response).toMatch(new RegExp("{"));

    expect(response).toMatch(new RegExp("{"));
  });

  it("Insert ES document", async () => {
    shouldResetSecurity = false;

    let index;
    let collection;
    let document;
    let response;

    await sdk.collection.create("nyc-open-data", "green-taxi", {
      mappings: {},
    });
    index = "nyc-open-data";
    collection = "green-taxi";

    try {
      const { stdout } = await kourou(
        "es:indices:insert",
        "&nyc-open-data.yellow-taxi",
        ["--id", "kindred", "--body", "{}"]
      );
      response = stdout;
    } catch (error) {
      console.error(error);
      throw error;
    }

    try {
      const { stdout } = await kourou(
        "es:indices:get",
        "&nyc-open-data.yellow-taxi",
        "kindred"
      );
      response = stdout;
    } catch (error) {
      console.error(error);
      throw error;
    }

    expect(response).toMatch(new RegExp("kindred"));
  });

  it("Create a snapshot repository", async () => {
    shouldResetSecurity = false;

    let index;
    let collection;
    let document;
    let response;

    try {
      const { stdout } = await kourou(
        "es:snapshot:create-repository",
        "backup",
        "/tmp/snapshots",
        ["--compress"]
      );
      response = stdout;
    } catch (error) {
      console.error(error);
      throw error;
    }

    expect(response).toMatch(new RegExp("Success"));
  });

  it("Dump ES data to a snapshot into a repository", async () => {
    shouldResetSecurity = false;

    let index;
    let collection;
    let document;
    let response;

    try {
      const { stdout } = await kourou(
        "es:snapshot:create",
        "backup",
        "test-snapshot",
        []
      );
      response = stdout;
    } catch (error) {
      console.error(error);
      throw error;
    }

    expect(response).toMatch(new RegExp("Success"));
  });

  it("List all available snapshot of a repository", async () => {
    shouldResetSecurity = false;

    let index;
    let collection;
    let document;
    let response;

    try {
      const { stdout } = await kourou("es:snapshot:list", "backup", []);
      response = stdout;
    } catch (error) {
      console.error(error);
      throw error;
    }

    expect(response).toMatch(new RegExp("test-snapshot"));
  });

  it("Dump and restore ES data to a dump folder using the pattern option", async () => {
    shouldResetSecurity = false;

    let index;
    let collection;
    let document;
    let response;

    index = await sdk.index.create("nyc-open-data");

    await sdk.collection.create("nyc-open-data", "yellow-taxi", {
      mappings: {},
    });
    index = "nyc-open-data";
    collection = "yellow-taxi";

    await sdk.document.create(
      index,
      collection,
      { city: "hcmc", district: 1 },
      "chuon-chuon-kim"
    );

    await sdk.document.create(
      index,
      collection,
      { city: "hcmc", district: 2 },
      "the-hive-vn"
    );

    await sdk.document.create(
      index,
      collection,
      { city: "changmai", district: 7 },
      "the-hive-th"
    );

    await expect(sdk.document.count(index, collection)).resolves.toBe(3);

    try {
      const { stdout } = await kourou("es:migrate", [
        "--src",
        "http://localhost:9200",
        "--dest",
        "./kourou-dump",
      ]);
      response = stdout;
    } catch (error) {
      console.error(error);
      throw error;
    }

    const lines = fs
      .readFileSync("./kourou-dump/&nyc-open-data.yellow-taxi.json", "utf8")
      .split("\n");
    expect(lines.filter((line) => line !== "").length).toBe(3);

    try {
      const { stdout } = await kourou("es:migrate", [
        "--src",
        "./kourou-dump",
        "--dest",
        "http://localhost:9200",
        "--reset",
        "--no-interactive",
      ]);
      response = stdout;
    } catch (error) {
      console.error(error);
      throw error;
    }

    await expect(sdk.index.exists("nyc-open-data")).resolves.toBe(true);
    index = "nyc-open-data";

    await expect(
      sdk.collection.exists("nyc-open-data", "yellow-taxi")
    ).resolves.toBe(true);
    collection = "yellow-taxi";

    await sdk.collection.refresh(index, collection);

    await expect(sdk.document.count(index, collection)).resolves.toBe(3);
  });
});
