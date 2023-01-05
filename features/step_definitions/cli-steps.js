const fs = require("fs");

const _ = require("lodash");
const should = require("should");
const { Then } = require("cucumber");

// this need to build the lib with "npm run build" first
const { execute } = require("../../lib/support/execute");

function kourou(...command) {
  const kourouRuntime = process.env.KOUROU_RUNTIME || "./bin/run";

  return execute(kourouRuntime, ...command);
}

Then("I subscribe to {string}:{string}", async function (index, collection) {
  this.props.executor = kourou("realtime:subscribe", index, collection);

  // wait to connect to Kuzzle
  await new Promise((resolve) => setTimeout(resolve, 4000));
});

Then("I kill the CLI process", async function () {
  this.props.executor.process.kill();

  // the promise will be rejected since we killed the process
  try {
    await this.props.executor;
  } catch (error) {
    this.props.result = error.result.stdout;
  }
});

Then("I run the command {string} with:", async function (command, dataTable) {
  const args = [];
  const flags = [];

  for (const columns of dataTable.rawTable) {
    const type = columns[0];

    if (type === "arg") {
      args.push(columns[1]);
    } else {
      flags.push(columns[1]);

      // Could be boolean flag
      if (columns[2]) {
        flags.push(columns[2]);
      }
    }
  }

  try {
    const { stdout } = await kourou(...command.split(" "), ...args, ...flags);

    this.props.result = stdout;
  } catch (error) {
    console.error(error);

    throw error;
  }
});

Then(
  "I run the command {string} with flags:",
  async function (command, dataTable) {
    const flagsObject = this.parseObject(dataTable);

    const flags = [];

    for (const [arg, value] of Object.entries(flagsObject)) {
      flags.push(arg);
      flags.push(value);
    }

    try {
      const { stdout } = await kourou(...command.split(" "), ...flags);

      this.props.result = stdout;
    } catch (error) {
      console.error(error);

      throw error;
    }
  }
);

Then(
  "I run the command {string} with args:",
  async function (command, dataTable) {
    const args = [];

    for (const row of dataTable.rawTable) {
      args.push(JSON.parse(row[0]));
    }

    try {
      const { stdout } = await kourou(command, ...args);

      this.props.result = stdout;
    } catch (error) {
      console.error(error);

      throw error;
    }
  }
);

Then(/I should( not)? match stdout with "(.*?)"/, function (not, rawRegexp) {
  const regexp = new RegExp(rawRegexp);

  if (not) {
    should(this.props.result).not.match(regexp);
  } else {
    should(this.props.result).match(regexp);
  }
});

Then(/I should( not)? match stdout with:/, function (not, dataTable) {
  for (const rawRegexp of _.flatten(dataTable.rawTable)) {
    const regexp = new RegExp(rawRegexp);

    if (not) {
      should(this.props.result).not.match(regexp);
    } else {
      should(this.props.result).match(regexp);
    }
  }
});

Then("a JSON file {string} containing:", function (filename, dataTable) {
  const content = {};
  const contentRaw = this.parseObject(dataTable);

  for (const [path, value] of Object.entries(contentRaw)) {
    _.set(content, path, value);
  }

  fs.writeFileSync(filename, JSON.stringify(content, null, 2));
});

Then("The file {string} content should match:", function (filename, dataTable) {
  const expectedContent = {};
  const contentRaw = this.parseObject(dataTable);

  for (const [path, value] of Object.entries(contentRaw)) {
    _.set(expectedContent, path, value);
  }

  const content = JSON.parse(fs.readFileSync(filename, "utf8"));

  should(content).matchObject(expectedContent);
});

Then("I create an API key", async function () {
  this.props.result = await this.sdk.security.createApiKey(
    "gordon",
    "Test API key"
  );
});

Then("I check the API key validity", async function () {
  try {
    const { stdout } = await kourou(
      "api-key:check",
      this.props.result._source.token
    );

    this.props.result = stdout;
  } catch (error) {
    console.error(error);

    throw error;
  }
});

Then(
  "I should get the correct current user with the given api-key",
  async function () {
    try {
      const { stdout } = await kourou(
        "sdk:query",
        "auth:getCurrentUser",
        "--api-key",
        this.props.result._source.token
      );

      this.props.result = stdout;
      should(this.props.result).match(/"_id": "gordon"/);
    } catch (error) {
      console.error(error);

      throw error;
    }
  }
);

Then("I delete index {string} using the Elasticsearch API", async function (index) {
  await this.esClient.indices.delete({ index });
});

Then("I restart and wait for Kuzzle", async function () {
  const { exec } = require('child_process');

  exec('docker restart kuzzle', (error) => {
    if (error) {
      console.error(`Error: ${error}`);
      return;
    }
  });

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await this.sdk.server.now();
      break;
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
});

Then("I should have {int} lines in file {string}", function (count, filename) {
  const lines = fs.readFileSync(filename, "utf8").split("\n");
  should(lines.filter((line) => line !== "").length).be.eql(count);
});
