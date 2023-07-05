import { useSdk } from "../../helpers/sdk";
import { beforeEachTruncateCollections } from "../../hooks/collections";
import { beforeEachLoadFixtures } from "../../hooks/fixtures";
import { resetSecurityDefault } from "../../hooks/securities";

import { Client } from "@elastic/elasticsearch";
import { execute } from "../../../lib/support/execute";
import fs from "fs";

jest.setTimeout(20000);

function kourou(...command: any[]) {
  const kourouRuntime = process.env.KOUROU_RUNTIME || "./bin/run";
  return execute(kourouRuntime, ...command);
}

describe("Elasticsearch", () => {
  const sdk = useSdk();
  let shouldResetSecurity = false;
  const shouldLogout = false;

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

  let index = "nyc-open-data";

  it("Get a document", async () => {
    shouldResetSecurity = false;

    const collection = "yellow-taxi";
    let response;

    await expect(sdk.index.exists(index)).resolves.toBe(true);

    await expect(
      sdk.collection.exists(index, "yellow-taxi")
    ).resolves.toBe(true);

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

    const collection = "green-taxi";
    let response;

    await sdk.collection.create(index, collection, {
      mappings: {},
    });

    try {
      const { stdout } = await kourou(
        "es:indices:cat",
        "--grep",
        index
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

    const collection = "green-taxi";
    let response;

    await sdk.collection.create(index, collection, {
      mappings: {},
    });

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
    let response;

    await sdk.collection.create(index, "green-taxi", {
      mappings: {},
    });

    try {
      const { stdout } = await kourou(
        "es:indices:insert",
        "&nyc-open-data.yellow-taxi",
        "--id", "kindred", "--body", "{}"
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

    let response;

    try {
      const { stdout } = await kourou(
        "es:snapshot:create-repository",
        "backup",
        "/tmp/snapshots",
        "--compress"
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

    let response;

    try {
      const { stdout } = await kourou(
        "es:snapshot:create",
        "backup",
        "test-snapshot"
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

    let response;

    try {
      const { stdout } = await kourou("es:snapshot:list", "backup");
      response = stdout;
    } catch (error) {
      console.error(error);
      throw error;
    }
  console.log(response);
    expect(response).toMatch(new RegExp("test-snapshot"));
  });

  it("Dump and restore ES data to a dump folder using the pattern option", async () => {
    shouldResetSecurity = false;

    let response;

    await sdk.index.delete(index);
    await sdk.index.create(index);

    let collection = "yellow-taxi";
    await sdk.collection.create(index, collection, {
      mappings: {},
    });

    await sdk.document.create(
      index,
      collection,
      { city: "hcmc", district: 1 },
      "chuon-chuon-kim",
      { refresh: 'wait_for' }
    );

    await sdk.document.create(
      index,
      collection,
      { city: "hcmc", district: 2 },
      "the-hive-vn",
      { refresh: 'wait_for' }
    );

    await sdk.document.create(
      index,
      collection,
      { city: "changmai", district: 7 },
      "the-hive-th",
      { refresh: 'wait_for' }
    );

    await expect(sdk.document.count(index, collection)).resolves.toBe(3);

    try {
      const { stdout } = await kourou("es:migrate",
        "--src",
        "http://localhost:9200",
        "--dest",
        "./kourou-dump",
      );
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
      await kourou("es:migrate",
        "--src",
        "./kourou-dump",
        "--dest",
        "http://localhost:9200",
        "--reset",
        "--no-interactive",
      );
    } catch (error) {
      console.error(error);
      throw error;
    }

    await expect(sdk.index.exists(index)).resolves.toBe(true);

    await expect(
      sdk.collection.exists(index, "yellow-taxi")
    ).resolves.toBe(true);
    collection = "yellow-taxi";

    await sdk.collection.refresh(index, collection);

    await expect(sdk.document.count(index, collection)).resolves.toBe(3);
  });
});
