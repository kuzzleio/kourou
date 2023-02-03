import { expect, test } from "@oclif/test";
import { execSync } from "child_process";

const TEST_TIMEOUT = 50000;
const PRINT_STDOUT = false;

const checkStackDetails = (
  stdout: string,
  line: number,
  expectedValues: any
) => {
  const splittedOutput: string[] = stdout.split("\n");

  const stackLine: string[] = splittedOutput[6 + line]
    .split(/[ ]{1,}/)
    .join("")
    .split("│");

  expect(stackLine[1]).to.contain(expectedValues.index);
  expect(stackLine[2]).to.contain(expectedValues.name);
  expect(stackLine[3]).to.match(expectedValues.status);
  expect(stackLine[4]).to.contain(expectedValues.kuzzleVersion);
  expect(stackLine[5]).to.contain(expectedValues.kuzzlePort);
  expect(stackLine[6]).to.contain(expectedValues.esVersion);
  expect(stackLine[7]).to.contain(expectedValues.esPort);
  expect(stackLine[8]).to.contain(expectedValues.redisVersion);
  expect(stackLine[9]).to.contain(expectedValues.redisPort);
};

xdescribe("instance:list", () => {
  test
    .timeout(TEST_TIMEOUT)
    .stdout({ print: PRINT_STDOUT })
    .do(() => {
      execSync("./bin/run instance:spawn -v 2");
    })
    .command(["instance:list"])
    .finally(() => {
      execSync("docker stop $(docker ps -aq)");
    })
    .it("Lists a kuzzle v2", (ctx, done) => {
      checkStackDetails(ctx.stdout, 0, {
        index: "0",
        name: "stack-0",
        status:
          /'Up(Lessthanasecond|(\d{1,3}(second|seconds|minute|minutes)'))/,
        kuzzleVersion: "2",
        kuzzlePort: "7512",
        esVersion: "7",
        esPort: "9200",
        redisVersion: "5",
        redisPort: "6379",
      });
      done();
    });

  test
    .timeout(TEST_TIMEOUT)
    .stdout({ print: PRINT_STDOUT })
    .do(() => {
      execSync("./bin/run instance:spawn -v 1");
    })
    .command(["instance:list"])
    .finally(() => {
      execSync("docker stop $(docker ps -aq)");
    })
    .it("Lists a kuzzle v1", (ctx, done) => {
      checkStackDetails(ctx.stdout, 0, {
        index: "0",
        name: "stack-0",
        status:
          /'Up(Lessthanasecond|(\d{1,3}(second|seconds|minute|minutes)'))/,
        kuzzleVersion: "1",
        kuzzlePort: "7512",
        esVersion: "5",
        esPort: "9200",
        redisVersion: "5",
        redisPort: "6379",
      });
      done();
    });

  test
    .timeout(TEST_TIMEOUT)
    .stdout({ print: PRINT_STDOUT })
    .do(() => {
      execSync("./bin/run instance:spawn -v 2");
      execSync("./bin/run instance:spawn -v 2");
    })
    .command(["instance:list"])
    .finally(() => {
      execSync("docker stop $(docker ps -aq)");
    })
    .it("Lists some kuzzle v2", (ctx, done) => {
      checkStackDetails(ctx.stdout, 0, {
        index: "0",
        name: "stack-0",
        status:
          /'Up(Lessthanasecond|(\d{1,3}(second|seconds|minute|minutes)'))/,
        kuzzleVersion: "2",
        kuzzlePort: "7512",
        esVersion: "7",
        esPort: "9200",
        redisVersion: "5",
        redisPort: "6379",
      });
      checkStackDetails(ctx.stdout, 1, {
        index: "1",
        name: "stack-1",
        status:
          /'Up(Lessthanasecond|(\d{1,3}(second|seconds|minute|minutes)'))/,
        kuzzleVersion: "2",
        kuzzlePort: "7513",
        esVersion: "7",
        esPort: "9201",
        redisVersion: "5",
        redisPort: "6379",
      });
      done();
    });

  test
    .timeout(TEST_TIMEOUT)
    .stdout({ print: PRINT_STDOUT })
    .do(() => {
      execSync("./bin/run instance:spawn -v 1");
      execSync("./bin/run instance:spawn -v 1");
    })
    .command(["instance:list"])
    .finally(() => {
      execSync("docker stop $(docker ps -aq)");
    })
    .it("Lists some kuzzle v1", (ctx, done) => {
      checkStackDetails(ctx.stdout, 0, {
        index: "0",
        name: "stack-0",
        status:
          /'Up(Lessthanasecond|(\d{1,3}(second|seconds|minute|minutes)'))/,
        kuzzleVersion: "1",
        kuzzlePort: "7512",
        esVersion: "5",
        esPort: "9200",
        redisVersion: "5",
        redisPort: "6379",
      });
      checkStackDetails(ctx.stdout, 1, {
        index: "1",
        name: "stack-1",
        status:
          /'Up(Lessthanasecond|(\d{1,3}(second|seconds|minute|minutes)'))/,
        kuzzleVersion: "1",
        kuzzlePort: "7513",
        esVersion: "5",
        esPort: "9201",
        redisVersion: "5",
        redisPort: "6379",
      });
      done();
    });

  test
    .timeout(TEST_TIMEOUT)
    .stdout({ print: PRINT_STDOUT })
    .do(() => {
      execSync("./bin/run instance:spawn -v 2");
      execSync("./bin/run instance:spawn -v 1");
      execSync("./bin/run instance:spawn -v 2");
    })
    .command(["instance:list"])
    .finally(() => {
      execSync("docker stop $(docker ps -aq)");
    })
    .it("Lists some kuzzle v1 and v2", (ctx, done) => {
      checkStackDetails(ctx.stdout, 0, {
        index: "0",
        name: "stack-0",
        status:
          /'Up(Lessthanasecond|(\d{1,3}(second|seconds|minute|minutes)'))/,
        kuzzleVersion: "2",
        kuzzlePort: "7512",
        esVersion: "7",
        esPort: "9200",
        redisVersion: "5",
        redisPort: "6379",
      });
      checkStackDetails(ctx.stdout, 1, {
        index: "1",
        name: "stack-1",
        status:
          /'Up(Lessthanasecond|(\d{1,3}(second|seconds|minute|minutes)'))/,
        kuzzleVersion: "1",
        kuzzlePort: "7513",
        esVersion: "5",
        esPort: "9201",
        redisVersion: "5",
        redisPort: "6379",
      });
      checkStackDetails(ctx.stdout, 2, {
        index: "2",
        name: "stack-2",
        status:
          /'Up(Lessthanasecond|(\d{1,3}(second|seconds|minute|minutes)'))/,
        kuzzleVersion: "2",
        kuzzlePort: "7514",
        esVersion: "7",
        esPort: "9202",
        redisVersion: "5",
        redisPort: "6379",
      });
      done();
    });
});
