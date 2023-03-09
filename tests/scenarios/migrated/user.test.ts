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

describe("User", () => {
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
  it("Export users", async () => {
    shouldResetSecurity = true;

    let index;
    let collection;
    let document;
    let response;

    response = await sdk.security.createUser("kleiner", {
      content: { profileIds: ["admin"], email: "kleiner@blackmesa.us" },
      credentials: { local: { username: "kleiner", password: "password" } },
    });

    response = await sdk.security.createUser("alyx", {
      content: { profileIds: ["admin"], email: "alyx@blackmesa.us" },
      credentials: { local: { username: "alyx", password: "password" } },
    });

    try {
      const { stdout } = await kourou("user:export", [
        "--path",
        "./dump",
        "--exclude",
        "gordon",
        "--exclude",
        "test-admin",
      ]);
      response = stdout;
    } catch (error) {
      console.error(error);
      throw error;
    }
  });

  it("Export and import users mappings", async () => {
    shouldResetSecurity = true;

    let index;
    let collection;
    let document;
    let response;

    fs.writeFileSync(`./dump/user-mapping.json`, {
      type: "usersMappings",
      content: {
        mapping: {
          profileIds: { type: "keyword" },
          email: { type: "keyword" },
          age: { type: "integer" },
        },
      },
    });

    try {
      const { stdout } = await kourou(
        "user:import-mappings",
        "./dump/user-mapping.json",
        []
      );
      response = stdout;
    } catch (error) {
      console.error(error);
      throw error;
    }

    response = await sdk.query({
      controller: "security",
      action: "getUserMapping",
    });

    expect(response.result["mapping"]).toBeDefined();

    expect(response.result["mapping"]).toMatchObject({
      profileIds: { type: "keyword" },
      email: { type: "keyword" },
      age: { type: "integer" },
    });

    try {
      const { stdout } = await kourou("user:export-mappings", [
        "--path",
        "./dump",
      ]);
      response = stdout;
    } catch (error) {
      console.error(error);
      throw error;
    }

    expect(
      JSON.parse(
        fs.readFileSync("./dump/users-collection-mappings.json", "utf8")
      )
    ).toMatchObject({
      type: "usersMappings",
      content: {
        mapping: {
          age: { type: "integer" },
          email: { type: "keyword" },
          profileIds: { type: "keyword" },
        },
      },
    });
  });
});
