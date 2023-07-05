const { Then, When, Given} = require('cucumber');
const should = require("should");
const _ = require("lodash");

Given("an index {string}", async function (index) {
  global.converter.write(`
    index = await sdk.index.create("${index}");
  `);
});

Then('an existing index {string}', function (index) {
  global.converter.write(`
    await expect(sdk.index.exists("${index}")).resolves.toBe(true);
    index = "${index}";
  `);
});

Then('an existing collection {string}:{string}', async function (index, collection) {
  global.converter.write(`
    await expect(sdk.index.exists("${index}")).resolves.toBe(true);
    index = "${index}";

    await expect(sdk.collection.exists("${index}", "${collection}")).resolves.toBe(true);
    collection = "${collection}";
  `);
});


Then('I wait {int}ms', async function (ms) {
  global.converter.write(`
  await new Promise(resolve => setTimeout(resolve, ${ms}));`)
});

Then('I {string} the {string} {string} with content:', async function (action, type, id, config) {
  const document = this.parseObject(config);

  global.converter.write(`
    document = {
      type: "${type}",
      ${type}: ${JSON.stringify(document)}
    };
  `);

  if (action === 'create') {
    global.converter.write(`
      await sdk.document.create(index, 'config', document, "${id}");
    `);
  }
  else if (action === 'update') {
    global.converter.write(`
      await sdk.document.update(index, 'config', "${id}", document);
    `);
  }
  else {
    global.converter.write(`
      throw new Error("Unsupported action ${action}");
    `);
  }
});

Then("I {string} the following documents:", async function (action, dataTable) {
  action = `m${action[0].toUpperCase() + action.slice(1)}`;

  const documents = this.parseObjectArray(dataTable);

  global.converter.write(`
      response = await sdk.document["${action}"](
        index,
        collection,
        ${JSON.stringify(documents)}
      );
  `);
});

Then('I create the following document:', async function (dataTable) {
  const document = this.parseObject(dataTable);
  if(document._id) {
    const id = document._id;
    document._id = undefined;
    global.converter.write(`
      await sdk.document.create(index, collection, ${JSON.stringify(document.body)}, "${id}");
    `);
  } else {
    global.converter.write(`
      await sdk.document.create(index, collection, ${JSON.stringify(document.body)});
    `);
  }
});

Then('I try to {string} the {string} {string} with content:', async function (action, type, id, config) {
  const document = this.parseObject(config);

  global.converter.write(`
    document = {
      type: "${type}",
      ${type}: ${JSON.stringify(document)}
    };

    try {
  `);

  if (action === 'create') {
    global.converter.write(`
      await sdk.document.create(index, 'config', document, "${id}");
    `);
  }
  else if (action === 'update') {
    global.converter.write(`
      await sdk.document.update(index, 'config', "${id}", document);
    `);
  }
  else {
    global.converter.write(`
      throw new Error("Unsupported action ${action}");
    `);
  }

  global.converter.write(`
    }
    catch (err) {
      error = err;
    }
  `);
});

Then(/I "(.*?)" the document "(.*?)" with content:/, async function (action, _id, dataTable) {
  const content = this.parseObject(dataTable);

  if (action === 'create') {
    global.converter.write(`
      await sdk.document.create(index, collection, ${JSON.stringify(content)}, "${_id}");
    `);
  }
  else if (action === 'write') {
    throw new Error('Not Implemented')
  }
  else {
    global.converter.write(`
      await sdk.document.${action}(index, collection, "${_id}", ${JSON.stringify(content)});
    `);
  }
});

Then(/The document "(.*?)":"(.*?)":"(.*?)"( does not)? exist/, async function (index, collection, id, not) {
  if (not) {
    global.converter.write(`
      await expect(sdk.document.exists("${index}", "${collection}", "${id}")).resolves.toBe(false);
    `);
  }
  else {
    global.converter.write(`
      await expect(sdk.document.exists("${index}", "${collection}", "${id}")).resolves.toBe(true);
    `);
  }
});

Then('The document {string} should exist', function (id) {
  global.converter.write(`
      await expect(sdk.document.exists(index, collection, "${id}")).resolves.toBe(true);
  `);
});

Then('The document {string} should not exists', function (id) {
  global.converter.write(`
      await expect(sdk.document.exists(index, collection, "${id}")).resolves.toBe(false);
  `);
});

Then(/I "(.*?)" a role "(.*?)" with the following API rights:/, async function (method, roleId, dataTable) {
  const controllers = this.parseObject(dataTable);

  global.converter.write(`
    await sdk.security.${method}Role("${roleId}", { controllers: ${JSON.stringify(controllers)} })
  `);
});

Then('I\'m logged in Kuzzle as user {string} with password {string}', function (username, password) {
  global.converter.write(`
    shouldLogout = true;
    await sdk.auth.login('local', { username: "${username}", password: "${password}" });
  `);
});

Then('The document {string}:{string}:{string} content match:', async function (index, collection, documentId, dataTable) {
  const expectedContent = this.parseObject(dataTable);

  global.converter.write(`
    await expect(sdk.document.get("${index}", "${collection}", "${documentId}")).resolves.toMatchObject({ _source: ${JSON.stringify(expectedContent)} });
  `);
});

Then('The document {string} content match:', async function (documentId, dataTable) {
  const expectedContent = this.parseObject(dataTable);

  global.converter.write(`
    await expect(sdk.document.get(index, collection, "${documentId}")).resolves.toMatchObject({ _source: ${JSON.stringify(expectedContent)} });
  `);
});

Then('I target {string}', async function (node) {
  global.converter.write(`
    sdk = ${node};
  `);
});

Then('I delete the document {string}', async function (id) {
  global.converter.write(`
    await sdk.document.delete(index, collection, "${id}");
  `);
});

Then(/I (successfully )?execute the action "(.*?)":"(.*?)" with args:/, async function (expectSuccess, controller, action, dataTable) {
  const args = this.parseObject(dataTable);
  const query = {
    controller,
    action,
    ...args
  };

  if (expectSuccess) {
    global.converter.write(`
      response = await sdk.query(${JSON.stringify(query)});
    `);
  }
  else {
    throw new Error("Not Implemented");
  }
});

Then(/I (successfully )?execute the action "(.*?)":"(.*?)"$/, async function (expectSuccess, controller, action) {
  const query = {
    controller,
    action,
  };

  if (expectSuccess) {
    global.converter.write(`
      response = await sdk.query(${JSON.stringify(query)});
    `);
  }
  else {
    throw new Error("Not Implemented");
  }
});

Then('a collection {string}:{string}', async function (index, collection) {
  global.converter.write(`
    await sdk.collection.create("${index}", "${collection}", { mappings: {} });
    index = "${index}";
    collection = "${collection}";
  `);
});

Then('I refresh the collection {string}:{string}', function (index, collection) {
  global.converter.write(`
    await sdk.collection.refresh("${index}", "${collection}");
  `);
});

Then('I refresh the collection', function () {
  global.converter.write(`
    await sdk.collection.refresh(index, collection);
  `);
});

Then(
  "I truncate the collection {string}:{string}",
  function (index, collection) {
    global.converter.write(`
    await sdk.collection.truncate("${index}", "${collection}");
  `);
  }
);

Then('I should receive a result matching:', function (dataTable) {
  const expectedResult = this.parseObject(dataTable);

  global.converter.write(`
    expect(response.result).toMatchObject(${JSON.stringify(expectedResult)})
  `);
});

Then('I should receive an error matching:', function (dataTable) {
  const expectedError = this.parseObject(dataTable);

  global.converter.write(`
    expect(error).toMatchObject(${JSON.stringify(expectedError)})
  `);
});

Then('I count {int} documents in {string}:{string}', async function (expectedCount, index, collection) {
  global.converter.write(`
    await expect(sdk.document.count("${index}", "${collection}")).resolves.toBe(${expectedCount});
  `);
});

Then('I count {int} documents', async function (expectedCount) {
  global.converter.write(`
    await expect(sdk.document.count(index, collection)).resolves.toBe(${expectedCount});
  `);
});

When(
  /I (successfully )?call the route "(.*?)":"(.*?)"$/,
  async function (expectSuccess, controller, action) {
    const query = {
      controller,
      action
    };

    if (expectSuccess) {
      global.converter.write(`
      response = await sdk.query(${JSON.stringify(query)});
    `);
    }
    else {
      throw new Error("Not Implemented");
    }
  }
);

When(
  /I (successfully )?call the route "(.*?)":"(.*?)" with args:/,
  async function (expectSuccess, controller, action, dataTable) {
    const args = this.parseObject(dataTable);
    const query = {
      controller,
      action,
      ...args
    };

    if (expectSuccess) {
      global.converter.write(`
      response = await sdk.query(${JSON.stringify(query)});
    `);
    }
    else {
      throw new Error("Not Implemented");
    }
  }
);


Then("I subscribe to {string}:{string}", async function (index, collection) {
  global.converter.write(`
      executor = kourou("realtime:subscribe", "${index}", "${collection}");
  `);
});

Then("I kill the CLI process", async function () {
  global.converter.write(`
      executor.process.kill();
      try {
        await executor;
      } catch (error) {
        response = error.result.stdout;
      }
  `);
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
  args.push(flags);
  global.converter.write(`
        try {
          const { stdout } = await kourou("${command}", ${args.map(a => JSON.stringify(a)).join(",")});
          response = stdout;
        } catch (error) {
          console.error(error);
          throw error;
        }
  `);
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
    global.converter.write(`
        try {
          const { stdout } = await kourou("${command}", ${flags.map(a => `"${a}"`).join(",")});
          response = stdout;
        } catch (error) {
          console.error(error);
          throw error;
        }
  `);
  }
);

Then(
  "I run the command {string} with args:",
  async function (command, dataTable) {
    const args = [];

    for (const row of dataTable.rawTable) {
      args.push(JSON.parse(row[0]));
    }
    global.converter.write(`
        try {
          const { stdout } = await kourou("${command}", ${args.map(a => `"${a}"`).join(",")});
          response = stdout;
        } catch (error) {
          console.error(error);
          throw error;
        }
  `);
  }
);

Then(/I should( not)? match stdout with "(.*?)"/, function (not, rawRegexp) {
  if (not) {
    global.converter.write(`
      expect(response).not.toMatch(new RegExp(${JSON.stringify(rawRegexp)}));
  `);
  } else {
    global.converter.write(`
      expect(response).toMatch(new RegExp(${JSON.stringify(rawRegexp)}));
  `);
  }
});

Then(/I should( not)? match stdout with:/, function (not, dataTable) {
  for (const rawRegexp of _.flatten(dataTable.rawTable)) {
    if (not) {
      global.converter.write(`
      expect(response).not.toMatch(new RegExp(${JSON.stringify(rawRegexp)}));
    `);
      } else {
        global.converter.write(`
      expect(response).toMatch(new RegExp(${JSON.stringify(rawRegexp)}));
    `);
      }
  }
});

Then("a JSON file {string} containing:", function (filename, dataTable) {
  const content = {};
  const contentRaw = this.parseObject(dataTable);

  for (const [path, value] of Object.entries(contentRaw)) {
    _.set(content, path, value);
  }

  global.converter.write(`
       fs.writeFileSync("${filename}", ${JSON.stringify(content)});
  `);
});

Then("The file {string} content should match:", function (filename, dataTable) {
  const expectedContent = {};
  const contentRaw = this.parseObject(dataTable);

  for (const [path, value] of Object.entries(contentRaw)) {
    _.set(expectedContent, path, value);
  }

  global.converter.write(`
       expect(JSON.parse(fs.readFileSync("${filename}", "utf8"))).toMatchObject(${JSON.stringify(expectedContent)});
  `);
});


Then(
  "The property {string} of the result should match:",
  function (path, dataTable) {
    const expectedProperty = this.parseObject(dataTable);

    global.converter.write(`
       expect(response.result["${path}"]).toBeDefined()
  `);

    if (_.isPlainObject(expectedProperty)) {
      global.converter.write(`
       expect(response.result["${path}"]).toMatchObject(${JSON.stringify(expectedProperty)});
    `);
    } else {
      global.converter.write(`
        expect(response.result["${path}"]).toBe("${expectedProperty}");
    `);
    }

  }
);

Then("I create an API key", async function () {
  global.converter.write(`
       response = await sdk.security.createApiKey(
        "gordon",
        "Test API key"
      );
  `);
});

Then("I check the API key validity", async function () {
  global.converter.write(`
      try {
       const { stdout } = await kourou(
          "api-key:check",
          response.result._source.token
        );
        response = stdout;
      } catch (error) {
        console.error(error);
        throw error;
      }
  `);
});

Then(
  "I should get the correct current user with the given api-key",
  async function () {
    global.converter.write(`
      try {
        const { stdout } = await kourou(
          "api",
          "auth:getCurrentUser",
          "--api-key",
          response.result._source.token
        );
        response = stdout;
        expect(response).toMatch(/"_id": "gordon"/);
      } catch (error) {
        console.error(error);
        throw error;
      }
  `);
  }
);

Then("I delete index {string} using the Elasticsearch API", async function (index) {
  global.converter.write(`
     await this.esClient.indices.delete({ ${index} });
  `);
});

Then("I restart and wait for Kuzzle", async function () {
  global.converter.write(`
      exec('docker restart kuzzle', (error) => {
        if (error) {
          console.error(\`Error: \${error}\`);
          return;
        }
      });

      // eslint-disable-next-line no-constant-condition
      while (true) {
        try {
          await sdk.server.now();
          break;
        } catch (error) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
  `);
});

Then("I should have {int} lines in file {string}", function (count, filename) {
  global.converter.write(`
    const lines = fs.readFileSync("${filename}", "utf8").split("\\n");
    expect(lines.filter((line) => line !== "").length).toBe(${count});
  `);
});

Then("I get the file in {string} containing", function (path, contents) {
  global.converter.write(`
      expect(fs.readFileSync("${path}").toString()).resolves.toMatchObject(${JSON.stringify(contents)});
  `);
});

Then("I should receive a {string} array matching:", function (name, dataTable) {
  const expected = _.flatten(dataTable.rawTable).map(JSON.parse);
  global.converter.write(`
    expect(response.result["${name}"].length).toBe(${expected.length});
    expect(response.result["${name}"].sort()).toBe(${JSON.stringify(expected)}.sort());
  `);
});


Given(
  "I create a profile {string} with the following policies:",
  async function (profileId, dataTable) {
    const data = this.parseObject(dataTable),
      policies = [];
    for (const [roleId, restrictedTo] of Object.entries(data)) {
      policies.push({ roleId, restrictedTo });
    }
    global.converter.write(`
      response = await sdk.security.createProfile("${policies}", ${
      JSON.stringify({
        policies,
      })
    });
  `);
  }
);

Given(
  "I create a role {string} with the following API rights:",
  async function (roleId, dataTable) {
    const controllers = this.parseObject(dataTable);
    global.converter.write(`
      response = await sdk.security.createRole("${roleId}",
      ${JSON.stringify({
          controllers,
        })}
      );
  `);
  }
);

Then(/I delete the role "(.*?)"/, async function ( roleId) {
  global.converter.write(`
      await sdk.security.deleteRole("${roleId}");
  `);
});

Then(
  /I delete the profile "(.*?)"/,
  async function (profileId) {
      global.converter.write(`
        await sdk.security.deleteProfile("${profileId}");
    `);
    }
);

Given("I delete the user {string}", async function (userId) {
  global.converter.write(`
    response = await sdk.security.deleteUser("${userId}");
  `);
});

Given(
  "I create a user {string} with content:",
  async function (userId, dataTable) {
    const content = this.parseObject(dataTable);

    const body = {
      content,
      credentials: {
        local: {
          username: userId,
          password: "password",
        },
      },
    };

    global.converter.write(`
        response = await sdk.security.createUser("${userId}", ${JSON.stringify(body)});
  `);
  }
);

Given(
  "The profile {string} should match:",
  async function (profileId, dataTable) {
    const expectedPolicies = [];

    for (const [roleId, restrictedTo] of Object.entries(
      this.parseObject(dataTable)
    )) {
      expectedPolicies.push({ roleId, restrictedTo });
    }
    global.converter.write(`
        await expect(sdk.security.getProfile("${profileId}")).resolves.toMatchObject(${JSON.stringify(expectedPolicies)});
  `);
  }
);

Given("The role {string} should match:", async function (roleId, dataTable) {
  const expectedControllers = this.parseObject(dataTable);
  global.converter.write(`
   await expect(sdk.security.getRole("${roleId}").content).resolves.toMatchObject(${JSON.stringify(expectedControllers)});
  `);
});

Given("The user {string} should match:", async function (userId, dataTable) {
  const expectedContent = this.parseObject(dataTable);


  global.converter.write(`
   await expect(sdk.security.getUser("${userId}").content).resolves.toMatchObject(${JSON.stringify(expectedContent)});
  `);
});

Given(
  "I create an user mappings file named {string} file with content:",
  async function (filename, dataTable) {
    const content = this.parseObject(dataTable);

    const body = {
      type: "usersMappings",
      content: {
        mapping: {
          profileIds: {
            type: "keyword",
          },
          ...content,
        },
      },
    };

    global.converter.write(`
      fs.writeFileSync(\`./dump/${filename}\`, ${JSON.stringify(body)});
    `);
  }
);
