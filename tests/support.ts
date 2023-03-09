import { execSync } from "child_process";
import { KuzzleTestContext } from "./KuzzleTestContext";

/* eslint-disable no-console */
export function kourou(command: string) {
  const runtime = process.env.KOUROU_RUNTIME || "./bin/run";

  try {
    execSync(`${runtime} ${command}`);
  } catch (error: any) {
    console.log(error);
    console.log("STDOUT: ", error.stdout.toString());
    console.log("STDOUT: ", error.stderr.toString());
    throw error;
  }
}

/**
 * Init a clean context for Jest tests.
 * Connect to a Kuzzle then reset security, database and mappings.
 * After each test, disconnect.
 *
 * In each describe function that implements initContext is recommended
 * to add afterEach function to clean up data after each test or clean up
 * at the end of the test. It's a good practice to have a really clean
 * environnement after each test.
 *
 */
export function initContext(): KuzzleTestContext {
  process.env.NODE_ENV = "test";
  const context = new KuzzleTestContext();
  beforeAll(async () => {
    await context.connect();
    await context.resetSecurity();
    await context.resetDatabase();
    await context.resetMappings();
  });
  afterAll(() => {
    context.disconnect();
  });
  return context;
}
