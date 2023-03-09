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

describe("Profile", () => {
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
  it("Export profiles", async () => {
    shouldResetSecurity = true;

    let index;
    let collection;
    let document;
    let response;

    response = await sdk.security.createProfile("[object Object]", {
      policies: [
        { roleId: "default", restrictedTo: [{ index: "nyc-open-data" }] },
      ],
    });

    response = await sdk.security.createProfile("[object Object]", {
      policies: [
        { roleId: "admin", restrictedTo: [{ index: "mtp-open-data" }] },
      ],
    });

    try {
      const { stdout } = await kourou("export:profile", ["--path", "./dump"]);
      response = stdout;
    } catch (error) {
      console.error(error);
      throw error;
    }
  });
});
