import { test } from "@oclif/test";
import { execSync } from "child_process";

const SECOND = 1000;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// TODO: fix this test to not skip it
xdescribe("services:start", () => {
  test
    .timeout(50 * SECOND)
    .stdout({ print: false })
    .command(["services:start"])
    .finally(() => {
      execSync("docker stop $(docker ps -aq)");
    })
    .it("Spawns Kuzzle v2 services", async (ctx, done) => {
      await wait(10 * SECOND);
      expect(ctx.stdout).toContain("Elasticsearch and Redis are launching")
      expect(ctx.stdout).toContain("Elasticsearch and Redis are booting in the background right now")
      done();
    });
});
