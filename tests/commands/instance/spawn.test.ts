import { expect, test } from "@oclif/test";
import { execSync } from "child_process";

const TEST_TIMEOUT = 50000;
const WAIT_TIME_BEFORE_TEST = 10000;
const wait = (ms = 10) => new Promise((resolve) => setTimeout(resolve, ms));
const PRINT_STDOUT = false;

xdescribe("instance:spawn", () => {
  test
    .timeout(TEST_TIMEOUT)
    .stdout({ print: PRINT_STDOUT })
    .command(["instance:spawn"])
    .finally(() => {
      execSync("docker stop $(docker ps -aq)");
    })
    .it("Spawns a new Kuzzle v2", async (ctx, done) => {
      await wait(WAIT_TIME_BEFORE_TEST);
      expect(ctx.stdout).to.contain("Kuzzle version 2 is launching");
      expect(ctx.stdout).to.contain(
        "Kuzzle is booting in the background right now"
      );
      done();
    });

  test
    .timeout(TEST_TIMEOUT)
    .stdout({ print: PRINT_STDOUT })
    .command(["instance:spawn", "--version", "1"])
    .finally(() => {
      execSync("docker stop $(docker ps -aq)");
    })
    .it("Spawns a new Kuzzle v1", async (ctx, done) => {
      await wait(WAIT_TIME_BEFORE_TEST);
      expect(ctx.stdout).to.contain("Kuzzle version 1 is launching");
      expect(ctx.stdout).to.contain(
        "Kuzzle is booting in the background right now"
      );
      done();
    });
});
