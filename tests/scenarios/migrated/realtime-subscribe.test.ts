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

describe("RealtimeSubscribe", () => {
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
  it("Subscribe to notifications", async () => {
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

    executor = kourou("realtime:subscribe", "nyc-open-data", "yellow-taxi");

    await sdk.document.create(index, collection, {}, "chuon-chuon-kim");

    executor.process.kill();
    try {
      await executor;
    } catch (error) {
      response = error.result.stdout;
    }

    expect(response).toMatch(new RegExp("chuon-chuon-kim"));
  });
});
