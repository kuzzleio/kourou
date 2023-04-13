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

describe("Role", () => {
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
  it("Export and import roles", async () => {
    shouldResetSecurity = true;

    let index;
    let collection;
    let document;
    let response;

    response = await sdk.security.createRole("teacher", {
      controllers: { document: { actions: { create: true } } },
    });

    response = await sdk.security.createRole("student", {
      controllers: { document: { actions: { update: true } } },
    });

    try {
      const { stdout } = await kourou("role:export", ["--path", "./dump"]);
      response = stdout;
    } catch (error) {
      console.error(error);
      throw error;
    }
  });
});
