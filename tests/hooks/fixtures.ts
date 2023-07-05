import { Kuzzle } from "kuzzle-sdk";
import { testMappings } from "../fixtures/mappings";
import { testFixtures } from "../fixtures/fixtures";

export async function beforeEachLoadFixtures(sdk: Kuzzle) {
  await sdk.query({
    controller: "admin",
    action: "loadMappings",
    body: testMappings,
    refresh: "wait_for",
  });

  await sdk.query({
    controller: "admin",
    action: "loadFixtures",
    body: testFixtures,
    refresh: "wait_for",
  });
}
